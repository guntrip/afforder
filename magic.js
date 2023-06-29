
var version="0.02";
var afData = {};
var current = {today:0.0, week:0.0, month:0.0, balance_today:0.0, preview_daily: 0.0, preview_week:0.0, preview_month:0.0};

function calculate() {
  // Grab total budget and take off spending other than today's.
  var remaining_in_total = afData.monthly_budget
  var now = new Date();
  var d = now.getDate()
  for (var i=0;i<d-1;i++) {
    remaining_in_total -= afData.hist[i]
  }
  current.month = remaining_in_total
  current.preview_month = remaining_in_total - afData.hist[d-1] 
  
  // Days left in the month
  days_left = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate()

  // And how much if the budget is split by that many days?
  current.today = remaining_in_total / parseFloat(days_left)
  current.preview_daily = current.preview_month / parseFloat(days_left-1)
  
  // How per week?
  current.week = current.today * 7.0
  current.preview_week = current.preview_daily * 7.0

  // Now figure out today
  var spent_today = parseFloat(afData.hist[d-1])
  current.balance_today = current.today - spent_today

  console.log(current)
}

function load() {

  if (localStorage.getItem("afData") === null) {
    console.log('load() - json not found, resetting.');
    reset(false)
    
  } else {
     afData=JSON.parse(localStorage.afData)
     console.log('load() - found json.')
     console.log(afData)
     running_check()

     // Or are we possibly in a new month?

     calculate()
     draw();
	}

}

function running_check() {
  // Call it frequently, populates current day and resets on a new month
  // Are we in a new month?
  if (afData.this_month != new Date().getMonth()) {
    reset(true)
  }

  // Does today exist?
  var day = new Date().getDate()
  if (afData.hist.length < day) afData.hist.length.push(0.00)
}

function save() {
  localStorage.afData = JSON.stringify(afData);
}

function reset(keep_monthly_budget) {
  console.log('resetting')
  if (keep_monthly_budget) {
    afData = {monthly_budget:afData.monthly_budget}
  } else {
    afData = {monthly_budget:100.00}
  }
  afData.hist = new Array()
  afData.today_each = new Array()
  afData.this_month = new Date().getMonth()
  var n = new Date().getDate()
  for (var i=0;i<n;i++) {
    afData.hist.push(0.00)
  }
  console.log(afData)
  save()
  calculate()
  draw()
  if (!keep_monthly_budget) show_help()
}

function draw() {
  document.getElementById("spent").innerHTML = "&pound;" + current.balance_today.toFixed(2); 
  document.getElementById("balance").innerHTML = "&pound;" + current.today.toFixed(2); 
  
  document.getElementById("week_budget").innerHTML = "&pound;" + current.week.toFixed(2); 
  document.getElementById("month_budget").innerHTML = "&pound;" + current.month.toFixed(2); 

  if (afData.today_each.length == 0) {
    document.getElementById("spending_history_today").style.display = "none";
  } else {
    document.getElementById("spending_history_today").style.display = "block";
    var html = "<ul>"
    for (var i = 0; i < afData.today_each.length; i++) {
      html = html + "<li><span onclick='remove_spend_today("+i+");'>&pound;"+afData.today_each[i].toFixed(2)+"<span></li>"
    }
    html = html + "</ul>"
    document.getElementById("spend_today_data").innerHTML = html
  }

  if (current.balance_today >= 0) {
    document.getElementById("alert").style.display = "none";
  } else {
    document.getElementById("alert").style.display = "block";
    document.getElementById("overspent_amount").innerHTML = "&pound;" + Math.abs(current.balance_today).toFixed(2); 
    document.getElementById("overspent_preview").innerHTML =  "&pound;" + current.preview_daily.toFixed(2) + " each day, &pound;" + current.preview_week.toFixed(2)+ " each week, and &pound;" + current.preview_month.toFixed(2)+" for the month"
  }

  document.getElementById("about").innerHTML = "Afforder v"+version+", made by guntrip.co.uk"

}

function remove_spend_today(i) {
  var v = afData.today_each[i]
  if (confirm("Undo "+v.toFixed(2)+" spending?") == true) {
    afData.today_each.splice(i, 1);
    var day = new Date().getDate()
    afData.hist[day-1] = afData.hist[day-1] - v;
    calculate()
    save()
    draw() 
  }
}

function spend() {

  var s = parseFloat(prompt("Enter spending..", ""))

  if (s != null && (isFloat(s) || isInteger(s))) {
 
    // Does today exist?
    var day = new Date().getDate()
    if (afData.hist.length < day) afData.hist.length.push(0.00)

    // Add it
    afData.hist[day-1] = afData.hist[day-1] + s;

    afData.today_each.push(s)

    calculate()
    save()
    draw() 
  }
}

function update_monthly_budget() {
  var v = parseFloat(prompt("Update monthly budget", afData.monthly_budget));

  if (v != null && (isFloat(v) || isInteger(v))) {
    afData.monthly_budget = v
    calculate()
    save()
    draw() 
  }
}

function show_help() {
  document.getElementById("help").style.display = "block";
}

function hide_help() {
  document.getElementById("help").style.display = "none";
}


function isInteger(x) { return typeof x === "number" && isFinite(x) && Math.floor(x) === x; }
function isFloat(x) {return !!(x % 1);}