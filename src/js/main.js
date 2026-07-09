let sidebarArray =document.querySelectorAll(".sidebar-nav a");
let countrySelect =document.getElementById("global-country");
let views ={
    dashboard:document.getElementById("dashboard-view"),
  holidays :document.getElementById("holidays-view"),
   events :document.getElementById("events-view"),
 weather :document.getElementById("weather-view"),
  longWeekends :document.getElementById("long-weekends-view"),
 currency :document.getElementById("currency-view"),
 sunTimes :document.getElementById("sun-times-view"),
  myPlans:document.getElementById("my-plans-view"),
}
let selectedDestination = document.getElementById("selected-destination");
// ?===================================== render ALL =================================
for (let i = 0; i < sidebarArray.length; i++) {
    sidebarArray[i].addEventListener("click",function(){
        let dataView=sidebarArray[i].getAttribute("data-view");
        for (let j = 0; j < sidebarArray.length; j++) {
            sidebarArray[j].classList.remove("active");
        }
        this.classList.add("active");
          render(dataView);})    
}
function render(selectedView){
    for(let view in views){
        views[view].classList.remove("active");}
        views[selectedView].classList.add("active");
}
// ?=================================== holydays =================================
class Holidays {
    constructor(){
     this.holidaysContent =document.getElementById("holidays-content");
     this.data=[];
    }  
    async bringHolydays(year , countryCode) {
    let response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);
     this.data =await response.json();
    this.render();
    this.addEvents();
}
render(){
    const months = [
       "Jan","Feb", "Mar", "Apr", "May", "June", 
        "July", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
     let container="";
    for (let i = 0; i < this.data.length; i++) {
        const [year, month, day] = this.data[i].date.split('-');
        const dateObj = new Date(this.data[i].date);
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

 container +=`<div class="holiday-card">
              <div class="holiday-card-header">
                <div class="holiday-date-box"><span class="day">${parseInt(day)}</span><span class="month">${months[parseInt(month) - 1]}</span></div>
                <button class="holiday-action-btn"><i class="fa-regular fa-heart"></i></button>
              </div>
              <h3>${this.data[i].localName}</h3>
              <p class="holiday-name">${this.data[i].name}</p>
              <div class="holiday-card-footer">
                <span class="holiday-day-badge"><i class="fa-regular fa-calendar"></i> ${dayName}</span>
                <span class="holiday-type-badge">Public</span>
              </div>
            </div>`}
            this.holidaysContent.innerHTML=container;

}
addEvents() {
    let buttons =
        this.holidaysContent.querySelectorAll(".holiday-action-btn");
    buttons.forEach((btn, index) => {
        btn.addEventListener("click", () => {
            const holiday = this.data[index];
            const date = new Date(holiday.date);
            const months = [
                "Jan","Feb","Mar","Apr",
                "May","Jun","Jul","Aug",
                "Sep","Oct","Nov","Dec"];
            app.myPlans.save({
                id: holiday.date + holiday.name,
                type: "holiday",
                title: holiday.localName,
                subtitle: holiday.name,
                day: date.getDate(),
                month: months[date.getMonth()],
                dayName: date.toLocaleDateString("en-US",{weekday:"long"})});});});
}
}
// ? ==================================== events ===================================
class Events{
    constructor(){
        this.eventsContent = document.getElementById("events-content");
        this.data=[];
    }
    async bringEvents(cityName, countryCode) {
    this.eventsContent.innerHTML = `<p>Loading events...</p>`;
    const loading = document.getElementById("loading-overlay");

    loading.classList.remove("hidden");

    try {
        const response = await fetch(
            `https://app.ticketmaster.com/discovery/v2/events.json?apikey=10DZtUm87ZpB1ZUuRhvHsbfbtomQHEbY&city=${cityName}&countryCode=${countryCode}&size=20`
        );

        this.data = await response.json();

        this.render();
        this.addEvents();
    } catch (error) {
        this.eventsContent.innerHTML = `<p>Failed to load events.</p>`;
        console.error(error);
    } finally {
        loading.classList.add("hidden");
    }
}
render(){
    let container = "";
        if (this.data._embedded && this.data._embedded.events) {
            let events = this.data._embedded.events;
            for (let i = 0; i < events.length; i++) {
            let dateObj = new Date(events[i].dates.start.localDate);
           let formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                let imageUrl = events[i].images[0].url; 
                let eventDateStr = events[i].dates.start.localDate; 
                let dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
                let eventTime = ` at ${events[i].dates.start.localTime.substring(0, 5)}`;
                container += `
                <div class="event-card">
                  <div class="event-card-image">
                    <img src="${imageUrl}" alt="${ events[i].name}">
                    <span class="event-card-category">${events[i].classifications[0].segment.name}</span>
                    <button class="event-card-save"><i class="fa-regular fa-heart"></i></button>
                  </div>
                  <div class="event-card-body">
                    <h3>${events[i].name}</h3>
                    <div class="event-card-info">
                      <div><i class="fa-regular fa-calendar"></i>${formattedDate}${eventTime}</div>
                      <div><i class="fa-solid fa-location-dot"></i>${events[i]._embedded.venues[0].name}
</div>
                    </div>
                    <div class="event-card-footer">
                      <button class="btn-event"><i class="fa-regular fa-heart"></i> Save</button>
                      <a href="${events[i].url}" target="_blank" class="btn-buy-ticket"><i class="fa-solid fa-ticket"></i> Buy Tickets</a>
                    </div>
                  </div>
                </div>`;
            }
            this.eventsContent.innerHTML = container;
        } else {
            this.eventsContent.innerHTML = "<p>No events found for this city.</p>";
        }
}
addEvents() {
let buttons = this.eventsContent.querySelectorAll(".btn-event, .event-card-save");
    buttons.forEach((btn, index) => {
        btn.addEventListener("click", () => {
            let event = this.data._embedded.events[index];
            let date = new Date(event.dates.start.localDate);
            const months = [
                "Jan","Feb","Mar","Apr",
                "May","Jun","Jul","Aug",
                "Sep","Oct","Nov","Dec"
            ];
            app.myPlans.save({
                id: event.id,
                type: "event",
                title: event.name,
                subtitle: event._embedded.venues[0].name,
                day: date.getDate(),
                month: months[date.getMonth()],
                dayName: date.toLocaleDateString("en-US",{
                    weekday:"long"
                })
            });
        });
    });
   
}
}  
// ?==========================================  weekends ================================
class Weekends{
constructor(){
this.data=[];
this.lwContent =document.getElementById("lw-content");
}

async getLongWeekends(countryCode ,year) {
    const response =await fetch(`https://date.nager.at/api/v3/LongWeekend/${year}/${countryCode}`);
     this.data =await response.json();
    this.render();
    this.addEvents();

}

render(){
    let container="";
    for (let i = 0; i < this.data.length; i++) {
        container+=`
          <div class="lw-card">
              <div class="lw-card-header">
                <span class="lw-badge"><i class="fa-solid fa-calendar-days"></i> ${this.data[i].dayCount} Days</span>
                <button class="lw-save-btn"><i class="fa-regular fa-heart"></i></button>
              </div>
              <h3>Long Weekend #${i+1}</h3>
              <div class="lw-dates"><i class="fa-regular fa-calendar"></i>  ${this.formatHolidayRange(this.data[i].startDate, this.data[i].endDate)}</div>
              <div class="lw-days-visual">
                <div class="lw-day"><span class="name">Thu</span><span class="num">1</span></div>
                <div class="lw-day weekend"><span class="name">Fri</span><span class="num">2</span></div>
                <div class="lw-day weekend"><span class="name">Sat</span><span class="num">3</span></div>
                <div class="lw-day weekend"><span class="name">Sun</span><span class="num">4</span></div>
              </div><Br>
               ${this.data[i].needBridgeDay?`
              <div class="lw-info-box warning"><i class="fa-solid fa-info-circle"></i> Requires taking a bridge day off</div>`
              : `<div class="lw-info-box success"><i class="fa-solid fa-check-circle"></i> No extra days off needed!</div>`} </div>
             
            </div>
        `;
    }
        this.lwContent.innerHTML = container;

}

 formatHolidayRange(startDateStr, endDateStr) {
    const startObj = new Date(startDateStr);
    const endObj = new Date(endDateStr);
    const startMonth = startObj.toLocaleDateString('en-US', { month: 'short' });
    const startDay = startObj.getDate();
    const endMonth = endObj.toLocaleDateString('en-US', { month: 'short' });
    const endDay = endObj.getDate();
    const year = endObj.getFullYear();
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
}
addEvents(){
    let buttons = this.lwContent.querySelectorAll(".lw-save-btn");
    buttons.forEach((btn,index)=>{
        btn.addEventListener("click",()=>{
            let weekend = this.data[index];
            let start = new Date(weekend.startDate);
            const months=[
                "Jan","Feb","Mar","Apr",
                "May","Jun","Jul","Aug",
                "Sep","Oct","Nov","Dec"
            ];
            app.myPlans.save({
                id: weekend.startDate + weekend.endDate,
                type:"weekend",
                title:`Long Weekend (${weekend.dayCount} Days)`,
                subtitle:this.formatHolidayRange(
                    weekend.startDate,
                    weekend.endDate
                ),
                day:start.getDate(),
                month:months[start.getMonth()],
                dayName:start.toLocaleDateString("en-US",{
                    weekday:"long"
                })

            });

        });

    });

}

}
// ?========================================= wether ==================================
class Weather {
    constructor() {
        this.weatherDetailsGrid = document.querySelector(".weather-details-grid");
        this.hourlyScroll = document.querySelector(".hourly-scroll");
        this.forecastList = document.querySelector(".forecast-list");
    }

    async getCountryLocation(countryName){
    let response = await fetch(
`https://geocoding-api.open-meteo.com/v1/search?name=${countryName}&count=1&language=en&format=json`
    );
    let data = await response.json();
    if(data.results){
        let latitude=data.results[0].latitude;
        let longitude=data.results[0].longitude;
        this.getWeather(latitude,longitude);
    }
    }
    async getWeather(latitude,longitude){
let response=await fetch(
`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}
&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,uv_index
&hourly=temperature_2m,weather_code
&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max
&timezone=auto`);
let data=await response.json();
this.renderCurrent(data);
this.renderHourly(data);
    this.renderDaily(data);
}

renderCurrent(data){
let wind=`${Math.round(data.current.wind_speed_10m)} ${data.current_units.wind_speed_10m}`;
this.weatherDetailsGrid.innerHTML=`
<div class="weather-detail-card">
<div class="detail-icon humidity"><i class="fa-solid fa-droplet"></i></div>
<div class="detail-info"><span class="detail-label">Humidity</span>
<span class="detail-value">${data.current.relative_humidity_2m}%</span></div></div>
<div class="weather-detail-card"><div class="detail-icon wind">
<i class="fa-solid fa-wind"></i></div><div class="detail-info"><span class="detail-label">Wind</span>
<span class="detail-value">${wind}</span></div></div>
<div class="weather-detail-card"><div class="detail-icon uv"><i class="fa-solid fa-sun"></i></div>
<div class="detail-info"><span class="detail-label">UV</span>
<span class="detail-value">${data.current.uv_index}</span>
</div></div>`;
}

renderHourly(data){
let container="";
for(let i=0;i<8;i++){
let hour=new Date(data.hourly.time[i]).toLocaleTimeString("en-US",{
hour:"numeric"});
container+=`
<div class="hourly-item ${i==0?"now":""}">
<span class="hourly-time">${i==0?"Now":hour}</span>
<div class="hourly-icon">
<i class="${this.getWeatherIcon(data.hourly.weather_code[i])}"></i></div>
<span class="hourly-temp">${Math.round(data.hourly.temperature_2m[i])}°</span>
</div>`;}
this.hourlyScroll.innerHTML=container;}
    
renderDaily(data){
let container="";
for(let i=0;i<7;i++){
let date=new Date(data.daily.time[i]);
let day=date.toLocaleDateString("en-US",{weekday:"short"});
let month=date.toLocaleDateString("en-US",{month:"short"});
container+=`
<div class="forecast-day ${i==0?"today":""}">
<div class="forecast-day-name">
<span class="day-label">${i==0?"Today":day}</span>
<span class="day-date">${date.getDate()} ${month}</span>
</div><div class="forecast-icon">
<i class="${this.getWeatherIcon(data.daily.weather_code[i])}"></i>
</div>
<div class="forecast-temps">
<span class="temp-max">${Math.round(data.daily.temperature_2m_max[i])}°</span>
<span class="temp-min">${Math.round(data.daily.temperature_2m_min[i])}°</span>
</div></div>`;
}
this.forecastList.innerHTML=container;}

getWeatherIcon(code){
if(code==0)
return "fa-solid fa-sun";
if(code>=1 && code<=3)
return "fa-solid fa-cloud-sun";
if(code>=45 && code<=48)
return "fa-solid fa-smog";
if(code>=51 && code<=67)
return "fa-solid fa-cloud-rain";
if(code>=71 && code<=77)
return "fa-solid fa-snowflake";
if(code>=80 && code<=82)
return "fa-solid fa-cloud-showers-heavy";
return "fa-solid fa-cloud";
}

getWeatherText(code){
if(code==0) return "Clear Sky";
if(code<=3) return "Partly Cloudy";
if(code<=48) return "Fog";
if(code<=67) return "Rain";
if(code<=77) return "Snow";
if(code<=82) return "Showers";
return "Cloudy";
}
}
// ?============================================ Currency ================================
class Currency{
    constructor(){
         this.currencyFrom =document.querySelector("#currency-from");
       this.currencyTo =document.querySelector("#currency-to");
        this.convertBtn = document.getElementById("convert-btn");
       this.Amount =document.getElementById("currency-amount");
       this.currencyResult =document.getElementById("currency-result");
     this.result=0;
     this.data=null;
    }
async bringcurrency(){
     this.Container =``;
    let response = await fetch("https://v6.exchangerate-api.com/v6/beab2c13a61adb43e689501d/latest/USD");
    this.data =await response.json();
    this.rendercurrency();
}
async rendercurrency(){
     for (let rateKey in this.data.conversion_rates) {
        this.Container +=`
       <option value="${rateKey}" >${rateKey}</option>`;
    }
   this.currencyFrom.innerHTML=this.Container;
   this.currencyTo.innerHTML=this.Container;
   this.convertBtn.addEventListener("click", () => {
        this.result = ((this.Amount.value / this.data.conversion_rates[this.currencyFrom.value]) * this.data.conversion_rates[this.currencyTo.value]).toFixed(2);
        this.currencyResult.innerHTML =`
         <div class="conversion-display">
                <div class="conversion-from">
                  <span class="amount">${this.Amount.value}</span>
                  <span class="currency-code">${this.currencyFrom.value}</span>
                </div>
                <div class="conversion-equals"><i class="fa-solid fa-equals"></i></div>
                <div class="conversion-to">
                  <span class="amount">${this.result}</span>
                  <span class="currency-code">${this.currencyTo.value}</span>
                </div>
              </div>
              <div class="exchange-rate-info">
               <p>1 ${this.currencyFrom.value} = ${(this.data.conversion_rates[this.currencyTo.value] / this.data.conversion_rates[this.currencyFrom.value]).toFixed(2)} ${this.currencyTo.value}</p>

                <small>Last updated: January 25, 2026</small>
              </div>
        `;
    })
}
}
// ?============================================ sun ================================
class SunTimes {
    constructor() {
        this.sunContent = document.querySelector(".sun-times-grid"); 
        this.result =null;
    }

    async bringSunTimes(lat = 30.0444, lng = 31.2357) {
        const today = new Date().toISOString().split("T")[0];
        let response = await fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=${today}&formatted=0`);
         let data = await response.json();
         this.results = data.results;
         this.render();
    }

    async render(){
        const formatTime = (isoString) => new Date(isoString).
         toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
         this.container =`
         <div class="sun-time-card dawn">
                  <div class="icon"><i class="fa-solid fa-moon"></i></div>
                  <div class="label">Dawn</div>
                  <div class="time">${formatTime(this.results.civil_twilight_begin)}</div>
                  <div class="sub-label">Civil Twilight</div>
                </div>
                <div class="sun-time-card sunrise">
                  <div class="icon"><i class="fa-solid fa-sun"></i></div>
                  <div class="label">Sunrise</div>
                  <div class="time">${formatTime(this.results.sunrise)}</div>
                  <div class="sub-label">Golden Hour Start</div>
                </div>
                <div class="sun-time-card noon">
                  <div class="icon"><i class="fa-solid fa-sun"></i></div>
                  <div class="label">Solar Noon</div>
                  <div class="time">${formatTime(this.results.solar_noon)}</div>
                  <div class="sub-label">Sun at Highest</div>
                </div>
                <div class="sun-time-card sunset">
                  <div class="icon"><i class="fa-solid fa-sun"></i></div>
                  <div class="label">Sunset</div>
                  <div class="time">${formatTime(this.results.sunset)}</div>
                  <div class="sub-label">Golden Hour End</div>
                </div>
                <div class="sun-time-card dusk">
                  <div class="icon"><i class="fa-solid fa-moon"></i></div>
                  <div class="label">Dusk</div>
                  <div class="time">${formatTime(this.results.civil_twilight_end)}</div>
                  <div class="sub-label">Civil Twilight</div>
                </div>
                <div class="sun-time-card daylight">
                  <div class="icon"><i class="fa-solid fa-hourglass-half"></i></div>
                  <div class="label">Day Length</div>
                  <div class="time">${Math.floor(this.results.day_length / 3600)}h ${Math.floor((this.results.day_length % 3600) / 60)}m</div>
                  <div class="sub-label">Total Daylight</div>
                </div>`;

    this.sunContent.innerHTML = this.container;
    document.querySelector(".sun-value").innerHTML=`${Math.floor(this.results.day_length / 3600)}h ${Math.floor((this.results.day_length % 3600) / 60)}m`

    }
}
// ?============================================ My plans ================================
class MyPlans {
    constructor() {
        this.plansContent = document.getElementById("plans-content");
        this.savedPlans =JSON.parse(localStorage.getItem("plans")) || [];
        this.currentFilter = "all";
        this.bindEvents();
        this.render();
    }
    save(plan) {
            console.log("save called");

        let exists = this.savedPlans.find(item => item.id === plan.id);
        if (exists) return;
        this.savedPlans.push(plan);
        localStorage.setItem("plans",JSON.stringify(this.savedPlans));
        this.render();
    document.getElementById("modal-overlay").classList.remove("hidden");
document.getElementById("modal-body").innerHTML = "Added to My Plans";

setTimeout(() => {
    document.getElementById("modal-overlay").classList.add("hidden");
}, 500); }
        remove(id) {
    this.savedPlans = this.savedPlans.filter(plan => plan.id !== id);
    localStorage.setItem("plans",JSON.stringify(this.savedPlans));
    this.render();
    
}
    render() {
        if (this.savedPlans.length == 0) {
            this.plansContent.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fa-solid fa-heart-crack"></i>
                </div>
                <h3>No Saved Plans Yet</h3>
                <p>Start exploring and save holidays, events, or long weekends you like!</p></div>`;
           document.getElementById("filter-all-count").textContent = 0;
document.getElementById("filter-holiday-count").textContent = 0;
document.getElementById("filter-event-count").textContent = 0;
document.getElementById("filter-lw-count").textContent = 0;
                return;
        }
        let container = "";
        let plans = this.savedPlans;

if (this.currentFilter !== "all") {
    plans = this.savedPlans.filter(
        plan => plan.type === this.currentFilter
    );
}
        plans.forEach(plan => {
            container += `
            <div class="holiday-card">
                <div class="holiday-card-header">
                    <div class="holiday-date-box">
                        <span class="day">${plan.day}</span>
                        <span class="month">${plan.month}</span>
                    </div>
                </div>
                <h3>${plan.title}</h3>
                <p>${plan.subtitle}</p>
                <div class="holiday-card-footer"><span>${plan.dayName}</span>
                </div>
                <button class="btn-plan-remove" data-id="${plan.id}">Remove</button>
            </div>`
            ;});
        this.plansContent.innerHTML = container;
        document.getElementById("filter-all-count").textContent =
    this.savedPlans.length;
    document.querySelector(".saved-plans-nums").innerHTML=this.savedPlans.length;

document.getElementById("filter-holiday-count").textContent =
    this.savedPlans.filter(plan => plan.type === "holiday").length;

document.getElementById("filter-event-count").textContent =
    this.savedPlans.filter(plan => plan.type === "event").length;

document.getElementById("filter-lw-count").textContent =
    this.savedPlans.filter(plan => plan.type === "weekend").length;
        this.addRemoveEvents();
       

    }
  bindEvents() {
    document.getElementById("clear-all-plans-btn").addEventListener("click", () => {
        this.savedPlans = [];
        localStorage.removeItem("plans");
        this.render();
    });
    let filters = document.querySelectorAll(".plan-filter");
    filters.forEach(filter => {
        filter.addEventListener("click", () => {
            filters.forEach(btn => btn.classList.remove("active"));
            filter.classList.add("active");
            this.currentFilter = filter.dataset.filter;
            this.render();});
    });
}
addRemoveEvents() {
    let buttons = this.plansContent.querySelectorAll(".btn-plan-remove");

    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            let id = btn.dataset.id;

            Swal.fire({
                title: "Remove Plan?",
                text: "Are you sure you want to remove this plan?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "rgb(159, 159, 163)",
                confirmButtonText: "Yes, remove it!"
            }).then((result) => {

                if (result.isConfirmed) {
                    this.remove(id);

                    Swal.fire({
                        title: "Deleted!",
                        text: "Your plan has been removed.",
                        icon: "success",
                        timer: 1500,
                        showConfirmButton: false
                    });
                }

            });
        });
    });
}
}
// ? ====================================== dashbord ===================================
class Dashbord{
    constructor(){
    }
    async bringDashbordOptions(){
    let response = await fetch("https://date.nager.at/api/v3/AvailableCountries");
this.countries = await response.json();
     this.renderDashbordOptions();
         return this.countries;

}
async renderDashbordOptions(){
    let container ="";
for (let i = 0; i < this.countries.length; i++) {
     container+= `<option value="${this.countries[i].countryCode}">{${this.countries[i].countryCode}} ${this.countries[i].name}</option>`;
}
countrySelect.innerHTML=container;
}
async rendertop (country){
    let container =`<div class="selected-flag">
                  <img id="selected-country-flag" src="${this.bringFlag(country.countryCode)}" alt="Egypt">
                </div>
                <div class="selected-info">
                  <span class="selected-country-name" id="selected-country-name">${country.name}</span>
                  <span class="selected-city-name" id="selected-city-name">• ${country.name}</span>
                </div>
                <button class="clear-selection-btn" id="clear-selection-btn">
                  <i class="fa-solid fa-xmark"></i>
                </button>`; 
                selectedDestination.innerHTML=container;
}
 bringFlag(code=""){
    return `https://flagcdn.com/w40/${code.toLocaleLowerCase()}.png`;
}
}
// ?===================================== country Info =================================
class CountryInfo {
    constructor() {
        this.section = document.getElementById("dashboard-country-info-section");
        this.countriesMap = new Map(); 
        this.loaded = false;
    }
    async loadAllCountries() {
        if (this.loaded) return;
        let offset = 0;
        const limit = 100;
        let more = true;
        while (more) {
            const url = `https://api.restcountries.com/countries/v5?api-key=rc_live_19fdbb6b1c1d4cc8a83ed39744aae4a2&limit=${limit}&offset=${offset}`;
            const response = await fetch(url);
            const json = await response.json();
            const objects = json.data.objects.filter(c => c.names);
            objects.forEach(c => {
                if (c.codes?.alpha_2) {
                    this.countriesMap.set(c.codes.alpha_2.toUpperCase(), c);
                }
            });
            more = json.data.meta.more;
            offset += limit;
        }
        this.loaded = true;
    }
    async showCountry(countryCode) {
        this.section.innerHTML = `<p>Loading country info...</p>`;
        document.getElementById("loading-overlay").classList.remove("hidden");
        await this.loadAllCountries();

        const country = this.countriesMap.get(countryCode.toUpperCase());
        if (!country) {
            this.section.innerHTML = `<p>No data found for this country.</p>`;
            return;
        }
        this.render(country);
    }

    render(c) {
        this.section.innerHTML = `
        <div class="section-header">
            <h2><i class="fa-solid fa-flag"></i> Country Information</h2>
        </div>
        <div id="dashboard-country-info" class="dashboard-country-info">
          <div class="dashboard-country-header">
            <img src="${c.flag?.url_png || ''}" alt="${c.names.common}" class="dashboard-country-flag">
            <div class="dashboard-country-title">
              <h3>${c.names.common}</h3>
              <p class="official-name">${c.names.official}</p>
              <span class="region"><i class="fa-solid fa-location-dot"></i> ${c.region} • ${c.subregion}</span>
            </div>
          </div>

          <div class="dashboard-local-time">
            <div class="local-time-display">
              <i class="fa-solid fa-clock"></i>
              <span class="local-time-value" id="country-local-time">--:--:--</span>
              <span class="local-time-zone">${c.timezones?.[0] || 'Local Time'}</span>
            </div>
          </div>

          <div class="dashboard-country-grid">
            <div class="dashboard-country-detail">
              <i class="fa-solid fa-building-columns"></i>
              <span class="label">Capital</span>
              <span class="value">${c.capitals?.[0]?.name || 'N/A'}</span>
            </div>
            <div class="dashboard-country-detail">
              <i class="fa-solid fa-users"></i>
              <span class="label">Population</span>
              <span class="value">${c.population ? c.population.toLocaleString() : 'N/A'}</span>
            </div>
            <div class="dashboard-country-detail">
              <i class="fa-solid fa-ruler-combined"></i>
              <span class="label">Area</span>
              <span class="value">${c.area?.kilometers ? c.area.kilometers.toLocaleString() + ' km²' : 'N/A'}</span>
            </div>
            <div class="dashboard-country-detail">
              <i class="fa-solid fa-globe"></i>
              <span class="label">Continent</span>
              <span class="value">${c.continents?.[0] || c.region}</span>
            </div>
            <div class="dashboard-country-detail">
              <i class="fa-solid fa-phone"></i>
              <span class="label">Calling Code</span>
              <span class="value">+${c.calling_codes?.[0] || 'N/A'}</span>
            </div>
            <div class="dashboard-country-detail">
              <i class="fa-solid fa-car"></i>
              <span class="label">Driving Side</span>
              <span class="value" style="text-transform: capitalize;">${c.cars?.driving_side || 'N/A'}</span>
            </div>
            <div class="dashboard-country-detail">
              <i class="fa-solid fa-calendar-week"></i>
              <span class="label">Week Starts</span>
              <span class="value" style="text-transform: capitalize;">${c.date?.start_of_week || 'N/A'}</span>
            </div>
          </div>

          <div class="dashboard-country-extras">
            <div class="dashboard-country-extra">
              <h4><i class="fa-solid fa-coins"></i> Currency</h4>
              <div class="extra-tags">
                ${c.currencies?.map(curr => `<span class="extra-tag">${curr.name} (${curr.symbol || curr.code})</span>`).join('') || 'N/A'}
              </div>
            </div>
            <div class="dashboard-country-extra">
              <h4><i class="fa-solid fa-language"></i> Languages</h4>
              <div class="extra-tags">
                ${c.languages?.map(lang => `<span class="extra-tag">${lang.name}</span>`).join('') || 'N/A'}
              </div>
            </div>
            <div class="dashboard-country-extra">
              <h4><i class="fa-solid fa-map-location-dot"></i> Neighbors</h4>
              <div class="extra-tags">
                ${c.borders?.map(b => `<span class="extra-tag border-tag">${b}</span>`).join('') || '<span class="extra-tag">None (Island)</span>'}
              </div>
            </div>
          </div>

          <div class="dashboard-country-actions">
            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.names.common)}" target="_blank" class="btn-map-link">
              <i class="fa-solid fa-map"></i> View on Google Maps
            </a>
          </div>
        </div>`;
    }
}
// ?===================================== APP =================================
class App{
    constructor(){
         this.countries = [];
        this.selectedCountry = null;
        this.holidays = new Holidays();
        this.events = new Events();
        this.weekends = new Weekends();
        this.weather = new Weather();
        this.currency = new Currency();
        this.sunTimes = new SunTimes();
        this.dashboard = new Dashbord();
        this.myPlans = new MyPlans();
        this.countryInfo = new CountryInfo();
        this.init();
    }
    async init(){
    this.countries = await this.dashboard.bringDashbordOptions();
    await this.currency.bringcurrency();
    countrySelect.addEventListener("change", () => {
        this.changeCountry();
    });

    document.getElementById("global-city").addEventListener("change", () => {
        const cityName = document.getElementById("global-city").value;
        if(cityName && this.selectedCountry){
            this.events.bringEvents(cityName, this.selectedCountry.countryCode);
        }
    });

    this.updateDateTime();
}
async changeCountry(){
    this.selectedCountry = this.countries.find(c => c.countryCode === countrySelect.value);
    document.querySelectorAll('.dynamic-country-name').forEach(element => {
        element.textContent = this.selectedCountry.name;
    });
    this.updateDateTime();
    this.dashboard.rendertop(this.selectedCountry);
    await this.countryInfo.showCountry(this.selectedCountry.countryCode); 
    this.populateCitySelect(this.selectedCountry.countryCode);
    this.updateModules();
}
updateModules(){
    this.holidays.bringHolydays(2026,this.selectedCountry.countryCode);
    this.weekends.getLongWeekends(this.selectedCountry.countryCode,2026);
    this.weather.getCountryLocation(this.selectedCountry.name);  
    this.sunTimes.bringSunTimes(30.0444, 31.2357);
}
updateDateTime() {
    const now = new Date();
    const formattedDate = now.toLocaleString('en-US', {
        weekday: 'short', 
        month: 'short',   
        day: 'numeric',   
        hour: '2-digit',  
        minute: '2-digit',
        hour12: true     
    });
    document.querySelectorAll('.dynamic-date-time').forEach(element => {
        element.textContent = formattedDate;
    });
}
populateCitySelect(countryCode){
    const country = this.countryInfo.countriesMap.get(countryCode.toUpperCase());
    const citySelect = document.getElementById("global-city");

    if(country && country.capitals && country.capitals.length){
        citySelect.innerHTML = country.capitals
            .map(cap => `<option value="${cap.name}">${cap.name}</option>`)
            .join('');
    } else {
        citySelect.innerHTML = `<option value="">N/A</option>`;
    }
    const cityName = citySelect.value;
    if(cityName){
        this.events.bringEvents(cityName, countryCode);
    }
}
}
let app =new App();
