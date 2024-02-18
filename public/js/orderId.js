 const orderId =function() {
    console.log("hello555");
let now = Date.now().toString() // '1492341545873'
// pad with extra random digit
now += now + Math.floor(Math.random() * 10)
// format
return  'ORD-'+[now.slice(0, 4), now.slice(4, 10), now.slice(10, 14)].join('-')
}

module.exports = orderId