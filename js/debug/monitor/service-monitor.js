// =====================================
// RIGO AI
// SERVICE MONITOR
// =====================================

const serviceMonitorState =
Object.seal({

  active:
  false,

  services:
  new Map(),

  diagnostics:{

    healthy:0,

    warning:0,

    critical:0,

    offline:0

  }

});



// =====================================
// STATUS
// =====================================

const ServiceStatus =
Object.freeze({

  HEALTHY:
  "healthy",

  WARNING:
  "warning",

  CRITICAL:
  "critical",

  OFFLINE:
  "offline"

});



// =====================================
// REGISTER
// =====================================

function registerService(

  serviceId,

  status =
  ServiceStatus
  .HEALTHY

){

  serviceMonitorState
  .services
  .set(

    serviceId,

    {

      id:
      serviceId,

      status,

      updatedAt:
      Date.now()

    }

  );

  return true;

}



// =====================================
// UPDATE
// =====================================

function updateServiceStatus(

  serviceId,

  status

){

  const service =

    serviceMonitorState
    .services
    .get(
      serviceId
    );

  if(
    !service
  ){

    return false;

  }

  service.status =
  status;

  service.updatedAt =
  Date.now();

  calculateServiceHealth();
  
  return true;

}



// =====================================
// GET
// =====================================

function getService(

  serviceId

){

  return (

    serviceMonitorState
    .services
    .get(
      serviceId
    ) ||

    null

  );

}



// =====================================
// HEALTH
// =====================================

function calculateServiceHealth(){

  let healthy = 0;

  let warning = 0;

  let critical = 0;

  let offline = 0;

  for(
    const service
    of serviceMonitorState
    .services
    .values()
  ){

    switch(
      service.status
    ){

      case
      ServiceStatus
      .HEALTHY:

        healthy++;
        break;

      case
      ServiceStatus
      .WARNING:

        warning++;
        break;

      case
      ServiceStatus
      .CRITICAL:

        critical++;
        break;

      case
      ServiceStatus
      .OFFLINE:

        offline++;
        break;

    }

  }

  serviceMonitorState
  .diagnostics
  .healthy =
  healthy;

  serviceMonitorState
  .diagnostics
  .warning =
  warning;

  serviceMonitorState
  .diagnostics
  .critical =
  critical;

  serviceMonitorState
  .diagnostics
  .offline =
  offline;

  return structuredClone(

    serviceMonitorState
    .diagnostics

  );

}



// =====================================
// START
// =====================================

function startServiceMonitor(){

  serviceMonitorState
  .active =
  true;

  return true;

}



// =====================================
// STOP
// =====================================

function stopServiceMonitor(){

  serviceMonitorState
  .active =
  false;

  return true;

}



// =====================================
// SNAPSHOT
// =====================================

function snapshot(){

  return Object.freeze({

    active:
    serviceMonitorState
    .active,

    services:

    serviceMonitorState
    .services
    .size,

    diagnostics:

    calculateServiceHealth(),

    serviceList:

    [

      ...serviceMonitorState
      .services
      .values()

    ],
    
    timestamp:
    Date.now()

  });

}



// =====================================
// API
// =====================================

export const ServiceMonitor =
Object.freeze({

  start:
  startServiceMonitor,

  stop:
  stopServiceMonitor,

  register:
  registerService,

  update:
  updateServiceStatus,

  get:
  getService,

  health:
  calculateServiceHealth,

  snapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  ServiceStatus

};

export default
ServiceMonitor;
