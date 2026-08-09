// =====================================
// RIGO AI
// LIVE WEATHER TOOL API
// VERCEL SERVERLESS FUNCTION
// =====================================

function send(response,status,body){
  response.status(status).json(body);
}

function number(value){
  const parsed=Number(value);
  return Number.isFinite(parsed)?parsed:null;
}

function weatherText(code){
  const map={
    0:"clear sky",1:"mainly clear",2:"partly cloudy",3:"overcast",
    45:"fog",48:"depositing rime fog",51:"light drizzle",53:"moderate drizzle",55:"dense drizzle",
    56:"light freezing drizzle",57:"dense freezing drizzle",61:"slight rain",63:"moderate rain",65:"heavy rain",
    66:"light freezing rain",67:"heavy freezing rain",71:"slight snowfall",73:"moderate snowfall",75:"heavy snowfall",
    77:"snow grains",80:"slight rain showers",81:"moderate rain showers",82:"violent rain showers",
    85:"slight snow showers",86:"heavy snow showers",95:"thunderstorm",96:"thunderstorm with slight hail",99:"thunderstorm with heavy hail"
  };
  return map[code]||"unknown conditions";
}

export default async function handler(request,response){
  try{
    if(request.method!=="GET"){
      send(response,405,{ok:false,error:"METHOD_NOT_ALLOWED"});
      return;
    }

    const latitude=number(request.query?.lat);
    const longitude=number(request.query?.lon);

    if(latitude===null||longitude===null||Math.abs(latitude)>90||Math.abs(longitude)>180){
      send(response,400,{ok:false,error:"INVALID_COORDINATES"});
      return;
    }

    const url=new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude",String(latitude));
    url.searchParams.set("longitude",String(longitude));
    url.searchParams.set("current","temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,rain,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m");
    url.searchParams.set("daily","weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset");
    url.searchParams.set("timezone","auto");
    url.searchParams.set("forecast_days","3");

    const upstream=await fetch(url.toString(),{headers:{"User-Agent":"RIGO-AI/1.0"}});
    const data=await upstream.json();

    if(!upstream.ok){
      send(response,upstream.status,{ok:false,error:"WEATHER_PROVIDER_FAILED",details:data});
      return;
    }

    const current=data.current||{};
    const daily=data.daily||{};
    const days=(daily.time||[]).map((date,index)=>({
      date,
      condition:weatherText(daily.weather_code?.[index]),
      weatherCode:daily.weather_code?.[index]??null,
      maxC:daily.temperature_2m_max?.[index]??null,
      minC:daily.temperature_2m_min?.[index]??null,
      precipitationProbability:daily.precipitation_probability_max?.[index]??null,
      sunrise:daily.sunrise?.[index]??null,
      sunset:daily.sunset?.[index]??null
    }));

    send(response,200,{
      ok:true,
      source:"Open-Meteo",
      latitude:data.latitude,
      longitude:data.longitude,
      timezone:data.timezone,
      current:{
        time:current.time||null,
        temperatureC:current.temperature_2m??null,
        feelsLikeC:current.apparent_temperature??null,
        humidity:current.relative_humidity_2m??null,
        precipitationMm:current.precipitation??null,
        rainMm:current.rain??null,
        cloudCover:current.cloud_cover??null,
        windSpeedKmh:current.wind_speed_10m??null,
        windDirection:current.wind_direction_10m??null,
        weatherCode:current.weather_code??null,
        condition:weatherText(current.weather_code)
      },
      forecast:days,
      fetchedAt:Date.now()
    });
  }
  catch(error){
    send(response,500,{ok:false,error:error?.message||String(error),timestamp:Date.now()});
  }
}
