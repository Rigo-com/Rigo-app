// =====================================
// RIGO AI
// MONITOR INDEX
// PUBLIC API
// =====================================



// =====================================
// IMPORTS
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
  ServiceMonitor,

  ServiceStatus

}
from "./service-monitor.js";



// =====================================
// EXPORTS
// =====================================

export {

  MemoryMonitor,

  PerformanceMonitor,

  NetworkMonitor,

  EventMonitor,

  ServiceMonitor,

  ServiceStatus

};



// =====================================
// DEFAULT API
// =====================================

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
