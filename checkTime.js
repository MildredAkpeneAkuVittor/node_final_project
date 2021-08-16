const moment =require('moment');

function setEpiryDate(nod) {
    return  moment().add(nod, 'days').format('yyyy-MM-DD');
}

function isExpire(startDate) {
    const date1 = new Date(previousDate);
    const date2 = new Date(moment().format('yyyy-MM-DD'));
  
    // To calculate the time difference of two dates
    const Difference_In_Time = date2.getTime() - date1.getTime();
    
    return Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
}
    

module.exports = { setEpiryDate, isExpire };