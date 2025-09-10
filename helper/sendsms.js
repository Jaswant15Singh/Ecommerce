const axios = require('axios');

async function sendSMS(mobileno, otp) {
  const MAIN_URI = "https://web.smsgw.in/smsapi/httpapi.jsp";
  const params = {
    username: 'cableguysms',
    password: 'CableSMS$24',
    to: `91${mobileno}`,
    from: 'CATVCG',
    text: `Dear Customer, your otp is ${otp} -CATV`,
    pe_id: '1101587750000022484',
    template_id: '1107165285732107395'
  };
  const queryString = new URLSearchParams(params).toString();
  const fullUrl = `${MAIN_URI}?${queryString}`;
  console.log("Generated URL:", fullUrl); // Log the full URL

  try {
    const response = await axios.get(MAIN_URI, { params });
    // console.log(response)
    // console.log(MAIN_URI,params)
    const body = response.data;

    const transId = body.split('#')[0];

    if (!transId || body.includes("Template Did Not Matched")) {
      console.error("Error while sending OTP");
      return { success: false, msg: "Error while sending OTP" };
    } else {
      return { success: true, msg: "OTP sent successfully" };
    }
  } catch (error) {
    console.error("Error:", error);
    return { success: false, msg: "Server Down" };
  }
}

module.exports = sendSMS;