import { API_CONFIG } from "./api-config.js";
import { apiState } from "./api-state.js";
import { APIValidationError } from "./api-errors.js";
import { executeRequest } from "./api-request.js";
import { createRequestId } from "./api-helpers.js";
import { API_EVENTS, emitAPIEvent } from "./api-events.js";

function validateFile(file){
  if(typeof File === "undefined") throw new APIValidationError("File API unavailable");
  if(!(file instanceof File)) throw new APIValidationError("Invalid file");
  return true;
}

async function uploadFile(file, options = {}){
  validateFile(file);
  const { endpoint = API_CONFIG.UPLOAD_ENDPOINT, fieldName = "file", metadata, headers = {}, ...requestOptions } = options;
  if(typeof endpoint !== "string" || endpoint.trim() === ""){
    throw new APIValidationError("Upload endpoint is required");
  }

  const uploadId = createRequestId();
  const formData = new FormData();
  formData.append(fieldName, file);
  if(metadata !== undefined) formData.append("metadata", typeof metadata === "string" ? metadata : JSON.stringify(metadata));

  const upload = { id:uploadId, endpoint, name:file.name, size:file.size, type:file.type, state:"uploading", startedAt:Date.now() };
  apiState.uploads.set(uploadId, upload);
  apiState.diagnostics.uploads += 1;
  emitAPIEvent(API_EVENTS.UPLOAD_STARTED, { ...upload });

  try{
    const result = await executeRequest(endpoint, {
      ...requestOptions,
      requestId:uploadId,
      method:"POST",
      body:formData,
      headers:{ Accept:"application/json", ...headers }
    });
    upload.state = "completed";
    upload.completedAt = Date.now();
    emitAPIEvent(API_EVENTS.UPLOAD_COMPLETED, { ...upload });
    return result;
  } catch(error){
    upload.state = "failed";
    upload.failedAt = Date.now();
    apiState.diagnostics.uploadFailures += 1;
    emitAPIEvent(API_EVENTS.UPLOAD_FAILED, { ...upload, code:error?.code, message:error?.message });
    throw error;
  } finally {
    apiState.uploads.delete(uploadId);
  }
}

export { uploadFile };
