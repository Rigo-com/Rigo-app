// =====================================
// RIGO AI
// MONITOR INDEX
// PUBLIC API
// =====================================



// =====================================
// MEMORY
// =====================================

export {
  MemoryMonitor
}
from "./memory-monitor.js";



// =====================================
// PERFORMANCE
// =====================================

export {
  PerformanceMonitor
}
from "./performance-monitor.js";



// =====================================
// NETWORK
// =====================================

export {
  NetworkMonitor
}
from "./network-monitor.js";



// =====================================
// EVENTS
// =====================================

export {
  EventMonitor
}
from "./event-monitor.js";



// =====================================
// SERVICES
// =====================================

export {
  ServiceMonitor,

  ServiceStatus

}
from "./service-monitor.js";



// =====================================
// DEFAULT API
// =====================================

import {
  MemoryMonitor
}
from "./memory-monitor.js";

import {
  PerformanceMonitor
}
from "./performance-monitor.js";

import {
  NetworkMonitor
}
from "./network-monitor.js";

import {
  EventMonitor
}
from "./event-monitor.js";

import {
  ServiceMonitor
}
from "./service-monitor.js";



const Monitor =
Object.freeze({

  memory:
  MemoryMonitor,

  performance:
  PerformanceMonitor,

  network:
  NetworkMonitor,

  events:
  EventMonitor,

  services:
  ServiceMonitor

});



// =====================================
// EXPORTS
// =====================================

export default
Monitor;
