import { SECURITY_SEVERITY, SECURITY_EVENTS } from "./security-types.js";
import SecuritySanitize from "./security-sanitize.js";
import SecurityFreeze from "./security-freeze.js";

const SECURITY_MONITOR_CONFIG = Object.freeze({ MAX_EVENTS:1000 });
const securityMonitorState = Object.seal({ events:[] });

function createEventId(){
  if(typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `event_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function normalizeDetails(details){
  if(!details || typeof details !== "object" || Array.isArray(details)) return Object.freeze({ value:String(details ?? "") });
  return SecurityFreeze.deepFreeze(SecuritySanitize.value(details));
}

function createSecurityEvent(type, details = {}, severity = SECURITY_SEVERITY.INFO){
  if(typeof type !== "string" || !type.trim()) throw new TypeError("Invalid event type");
  if(!Object.values(SECURITY_SEVERITY).includes(severity)) throw new TypeError("Invalid event severity");
  return Object.freeze({
    id:createEventId(),
    type:type.trim(),
    severity,
    timestamp:Date.now(),
    details:normalizeDetails(details)
  });
}

function recordEvent(type, details = {}, severity = SECURITY_SEVERITY.INFO){
  const event = createSecurityEvent(type, details, severity);
  securityMonitorState.events.push(event);
  if(securityMonitorState.events.length > SECURITY_MONITOR_CONFIG.MAX_EVENTS){
    securityMonitorState.events.splice(0, securityMonitorState.events.length - SECURITY_MONITOR_CONFIG.MAX_EVENTS);
  }
  return event;
}

const recordViolation = (type, details = {}) => recordEvent(type, details, SECURITY_SEVERITY.ERROR);
const getEvents = () => Object.freeze([...securityMonitorState.events]);
const clearEvents = () => (securityMonitorState.events.length = 0, true);
function getMetrics(){
  let totalViolations = 0;
  for(const event of securityMonitorState.events){
    if(event.severity === SECURITY_SEVERITY.ERROR || event.severity === SECURITY_SEVERITY.CRITICAL) totalViolations++;
  }
  return Object.freeze({ totalEvents:securityMonitorState.events.length, totalViolations });
}

const SecurityMonitor = Object.freeze({
  events:SECURITY_EVENTS,
  record:recordEvent,
  violation:recordViolation,
  getEvents,
  clear:clearEvents,
  metrics:getMetrics
});

export { SECURITY_MONITOR_CONFIG, securityMonitorState, normalizeDetails, createSecurityEvent, recordEvent, recordViolation, getEvents, clearEvents, getMetrics, SecurityMonitor };
export default SecurityMonitor;
