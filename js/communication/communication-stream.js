import { COMMUNICATION_EVENTS, COMMUNICATION_LIMITS, COMMUNICATION_TIMERS } from "./communication-config.js";
import { emit } from "./communication-events.js";
import { CommunicationState } from "./communication-state.js";

let activeStreams = 0;

async function processStream(response, options = {}){
  if(!response?.body?.getReader) return false;
  if(activeStreams >= COMMUNICATION_LIMITS.MAX_STREAMS) return false;
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const timeout = Math.max(1, Number(options.timeout) || COMMUNICATION_TIMERS.STREAM_TIMEOUT);
  let timer;
  CommunicationState.setStreaming(true);
  activeStreams++;
  CommunicationState.incrementStreams();
  emit(COMMUNICATION_EVENTS.STREAM_STARTED, { requestId:options.requestId ?? null });
  try{
    while(true){
      if(options.signal?.aborted) throw new DOMException("Stream aborted", "AbortError");
      const read = Promise.race([
        reader.read(),
        new Promise((_, reject) => { timer = setTimeout(() => reject(new Error("STREAM_TIMEOUT")), timeout); })
      ]);
      const { done, value } = await read;
      clearTimeout(timer);
      if(done) break;
      const chunk = decoder.decode(value, { stream:true });
      if(chunk){ options.onChunk?.(chunk); emit(COMMUNICATION_EVENTS.STREAM_UPDATED, { requestId:options.requestId ?? null, chunk }); }
    }
    const finalChunk = decoder.decode();
    if(finalChunk){ options.onChunk?.(finalChunk); emit(COMMUNICATION_EVENTS.STREAM_UPDATED, { requestId:options.requestId ?? null, chunk:finalChunk }); }
    emit(COMMUNICATION_EVENTS.STREAM_COMPLETED, { requestId:options.requestId ?? null });
    return true;
  }
  catch(error){
    try { await reader.cancel(); } catch {}
    emit(COMMUNICATION_EVENTS.STREAM_ABORTED, { requestId:options.requestId ?? null, error });
    return false;
  }
  finally { clearTimeout(timer); activeStreams = Math.max(0, activeStreams - 1); CommunicationState.setStreaming(activeStreams > 0); }
}

async function cancelStream(reader){ try { await reader?.cancel(); return Boolean(reader); } catch { return false; } }
const getActiveStreamCount = () => activeStreams;
const CommunicationStream = Object.freeze({ processStream, cancelStream, active:getActiveStreamCount });
export { processStream, cancelStream, getActiveStreamCount, CommunicationStream };
export default CommunicationStream;
