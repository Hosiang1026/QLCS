const { daily } = require('../sh/input')
var calendar = require('../utils/calendar')

require("dotenv").config();

let loveContent;

async function sendMqttMsg(content, licenseContent) {
	const mqtt_host = process.env.mqtt_host || '';
	const mqtt_port = process.env.mqtt_port || '';
	const mqtt_username = process.env.mqtt_username || '';
	const mqtt_password = process.env.mqtt_password || '';

	if (!mqtt_host || !mqtt_port) {
		return;
	}

	const mqtt = require('mqtt');
	const clientId = 'mqtt_daily';
	const connectUrl = `mqtt://${mqtt_host}:${mqtt_port}`;
	const client = mqtt.connect(connectUrl, {
		clientId,
		clean: true,
		connectTimeout: 2000,
		username: mqtt_username,
		password: mqtt_password,
		reconnectPeriod: 1000,
	});

	const topic = 'qinglong/daily';
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');
	const hours = String(now.getHours()).padStart(2, '0');
	const minutes = String(now.getMinutes()).padStart(2, '0');
	const seconds = String(now.getSeconds()).padStart(2, '0');
	const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
	const licenseBody = (licenseContent || '')
		.replace(/^\s*\n*đłčŻäťśććć\s*\n*/u, '')
		.trim()
	const mqttLicense =
		licenseBody.length > 0 ? 'đłčŻäťśććć\n\n' + licenseBody : ''
	const data = {
		content: 'đčćĽćé\n\n' + content,
		license: mqttLicense,
		timestamp: timestamp
	};

	return new Promise((resolve, reject) => {
		client.on('connect', async () => {
			console.log('mqtt:Connected');
			try {
				const result = await new Promise((pubResolve, pubReject) => {
					client.publish(topic, JSON.stringify(data), { qos: 0, retain: true }, (error) => {
						if (error) {
							pubReject(error);
						} else {
							pubResolve();
						}
					});
				});
				console.log('mqtt:Published');
				setTimeout(() => {
					client.end();
					resolve();
				}, 500);
			} catch (error) {
				console.error('mqtt:Publish error', error);
				client.end();
				reject(error);
			}
		});

		client.on('error', (error) => {
			console.error('mqtt:Connection error', error);
			client.end();
			reject(error);
		});

		setTimeout(() => {
			if (client.connected === false) {
				client.end();
				reject(new Error('mqtt:Connection timeout'));
			}
		}, 2000);
	});
}

//ĺ¤çĺ˝ĺ¤Šé´ĺĺĺ˝ĺĺ¤Šć°
const handleFestivalSolarDate = (nowDate, lunarDate, currentYear, content) => {
    let festivalDate = '01-01';

    //N-2ĺš´
    let pre2FestivalDate = (currentYear-2) + '-' + festivalDate;
    let pre2FestivalSolarDate = calendar.conversion(pre2FestivalDate);
    let newlFtvYearDate = pre2FestivalSolarDate;

    //N-1ĺš´
    let preFestivalDate = (currentYear-1) + '-' + festivalDate;
    let preFestivalSolarDate = calendar.conversion(preFestivalDate);
    if (new Date(nowDate) >= new Date(preFestivalSolarDate)){
        newlFtvYearDate = preFestivalSolarDate;
    }

    //Nĺš´
    let curFestivalDate = currentYear + '-' + festivalDate;
    let curFestivalSolarDate = calendar.conversion(curFestivalDate);
    if (new Date(nowDate) >= new Date(curFestivalSolarDate)){
        newlFtvYearDate = curFestivalSolarDate;
    }

    //N+1ĺš´
    let nextFestivalDate = (currentYear+1) + '-' + festivalDate;
    let nextFestivalSolarDate = calendar.conversion(nextFestivalDate);
    if (new Date(nowDate) >= new Date(nextFestivalSolarDate)){
        newlFtvYearDate = nextFestivalSolarDate;
    }

    //N+2ĺš´
    let next2FestivalDate = (currentYear+2) + '-' + festivalDate;
    let next2FestivalSolarDate = calendar.conversion(next2FestivalDate);
    if (new Date(nowDate) >= new Date(next2FestivalSolarDate)){
        newlFtvYearDate = next2FestivalSolarDate;
    }

    //ĺ˝ĺĺ¤Šć°
    let yearDiffTime = calendar.diffTimeToDaily(nowDate, newlFtvYearDate)+1;
    let lunarDateStr = lunarDate.gzYear + lunarDate.Animal +'ĺš´' + lunarDate.IMonthCn + lunarDate.IDayCn + ' çŹŹ' + yearDiffTime + 'ĺ¤Š' ;
    content.push(`${nowDate} ${lunarDate.ncWeek} ${lunarDate.astro}\n${lunarDateStr}\n`);
};

//ĺ¤ççşŞĺżľćĽ
//type: 0 ä¸şç´ŻčŽĄĺ¨ĺš´(éłĺ)
//type: 1 ä¸şĺčŽĄĺ¨ĺš´(éłĺ)
//type: 2 ä¸şĺčŽĄĺ¨ĺš´(é´ĺ)
const handleAnniversaryDate = (nowDate, currentYear, todayArr, latelyArr) => {
    let anniversaryArr = daily.anniversary;
    if(anniversaryArr.length > 0){
        let tempName = '';
        let tempTime = 0;
        for (let i = 0; i < anniversaryArr.length; i++) {
            const element = anniversaryArr[i];
            let anniversaryName = element.name;
            let anniversaryDate = element.date;
            let anniversaryType = element.type;
            //čŽĄçŽĺˇŽĺź ä¸ćŹĄ
            let targetArr = anniversaryDate.split('-');
            let anniversaryYear = targetArr[0];
            let anniversaryMonth = targetArr[1];
            let anniversaryDay = targetArr[2];

            //N+1ĺš´
            let nextAnniversaryDate = (currentYear+1) + '-' + anniversaryMonth+'-'+anniversaryDay;
            //é´ĺč˝Źéłĺ
            if (anniversaryType == 2) {
                nextAnniversaryDate = calendar.conversion(nextAnniversaryDate);
            }
            let resAnniversaryDate = nextAnniversaryDate;

            //Nĺš´
            let curAnniversaryDate = currentYear + '-' + anniversaryMonth+'-'+anniversaryDay;
            //é´ĺč˝Źéłĺ
            if (anniversaryType == 2) {
                curAnniversaryDate = calendar.conversion(curAnniversaryDate);
            }
            if (new Date(nowDate) <= new Date(curAnniversaryDate)){
                resAnniversaryDate = curAnniversaryDate;
            }

            //N-1ĺš´
            let preAnniversaryDate = (currentYear-1) + '-' + anniversaryMonth+'-'+anniversaryDay;
            //é´ĺč˝Źéłĺ
            if (anniversaryType == 2) {
                preAnniversaryDate = calendar.conversion(preAnniversaryDate);
            }
            if (new Date(nowDate) <= new Date(preAnniversaryDate)){
                resAnniversaryDate = preAnniversaryDate;
            }

            let diffTime = calendar.diffTimeToDaily(nowDate, resAnniversaryDate);
            if (diffTime == 0) {
                if (anniversaryType == 2) {
                    let anniversarySolarDate = calendar.conversion(anniversaryDate);
                    let targetSolarArr = anniversarySolarDate.split('-');
                    anniversaryYear = targetSolarArr[0];
                }

                let diffYear = currentYear - anniversaryYear;
                let todayDate = '<'+anniversaryDate.split('-').join('.')+'>';
                let todayContent = ' ' + diffYear+'ĺ¨ĺš´ĺżŤäš';
                if (anniversaryName == 'çťĺŠçşŞĺżľćĽ'){
                    let marriageArr = daily.marriage;
                    for (let i = 0; i < marriageArr.length; i++) {
                        const element = marriageArr[i];
                        let marriageName = element.name;
                        let marriageAge = element.age;
                        if(marriageAge == diffYear){
                            todayContent = marriageName +'-'+ diffYear+'ĺ¨ĺš´ĺżŤäš';
                        }
                    }
                }
                var obj = {todayName:anniversaryName,todayDate:todayDate, todayContent:todayContent};
                todayArr.push(obj);
            }

            if (tempTime == 0){
                tempName = anniversaryName;
                tempTime = diffTime;
            }
            if (anniversaryType == 0) {
                //čŽĄçŽç´ŻčŽĄĺź
                let sumTime = calendar.sumTimeToNow(anniversaryDate, nowDate);
                loveContent = `\nđćäťŹĺ¨ä¸čľˇćçą: ${sumTime}ĺ¤Š`;
            }else{
                if (diffTime > 0&&diffTime < tempTime) {
                    tempName = anniversaryName;
                    tempTime = diffTime;
                }
            }
        }

        var obj = {tempName:tempName,tempTime:tempTime};
        latelyArr.push(obj);
    }
};

//ĺ¤ççćĽ
const handleBirthdayDate = (nowDate, lunarDate, currentYear, todayArr, latelyArr) => {
    let birthdayArr = daily.birthday;
    if(birthdayArr.length > 0){
        let tempName = '';
        let tempTime = 0;
        for (let i = 0; i < birthdayArr.length; i++) {
            const element = birthdayArr[i];
            let birthdayName = element.name;
            let birthdayDate = element.date;
            //čŽĄçŽĺˇŽĺź
            let targetArr = birthdayDate.split('-');
            let birthdayYear = targetArr[0];
            let birthdayMonth = targetArr[1];
            let birthdayDay = targetArr[2];

            //N+1ĺš´
            let nextBirthdayDate = (currentYear+1) + '-' + birthdayMonth+'-'+birthdayDay;
            let nextBirthdaySolarDate = calendar.conversion(nextBirthdayDate);
            let resBirthdayDate = nextBirthdaySolarDate;

            //Nĺš´
            let curBirthdayDate = currentYear + '-' + birthdayMonth+'-'+birthdayDay;
            let curBirthdaySolarDate = calendar.conversion(curBirthdayDate);
            if (new Date(nowDate) <= new Date(curBirthdaySolarDate)){
                resBirthdayDate = curBirthdaySolarDate;
            }

            //N-1ĺš´
            let preBirthdayDate = (currentYear-1) + '-' + birthdayMonth+'-'+birthdayDay;
            let preBirthdaySolarDate = calendar.conversion(preBirthdayDate);
            if (new Date(nowDate) <= new Date(preBirthdaySolarDate)){
                resBirthdayDate = preBirthdaySolarDate;
            }

            let diffTime = calendar.diffTimeToDaily(nowDate, resBirthdayDate);
            if (diffTime == 0) {
                //čˇĺçćĽćĺş§
                let anniversaryAstro = lunarDate.astro;
                let todayDate = '<'+birthdayDate.split('-').join('.')+'>';
                let todayAge = currentYear - birthdayYear;
                let todayContent = todayAge + 'ĺ˛' + anniversaryAstro;
                var obj = {todayName:birthdayName, todayDate:todayDate, todayContent:todayContent};
                todayArr.push(obj);
            }

            if (tempTime == 0){
                tempName = birthdayName;
                tempTime = diffTime;
            }

            if (diffTime > 0&&diffTime < tempTime) {
                tempName = birthdayName;
                tempTime = diffTime;
            }
        }

        var obj = {tempName:tempName,tempTime:tempTime};
        latelyArr.push(obj);
    }
};

// ĺ¤çćłĺŽčĺćĽ - äżŽĺ¤ç
const handleLegalDate = (nowDate, currentMDDate, currentYear, todayArr, latelyArr, tipsArr) => {
    let legalArr = daily.legal;
    if(legalArr.length > 0){
        let tempName = '';
        let tempTime = 0;
        for (let i = 0; i < legalArr.length; i++) {
            const element = legalArr[i];
            let legalName = element.name;
            let legalDate = element.date;
            let legalFreeway = element.freeway;
            let legalHoliday = element.holiday;
            let legalRepair = element.repair;
            var existHoliday = false;

            // čĄĽç­ććžĺćç¤ş
            if(legalHoliday != 0){
                existHoliday = legalHoliday.includes(currentMDDate);
                if(existHoliday){
                    let holidayFrist = currentYear + '-'+ legalHoliday[0];
                    let holidayDiff = calendar.sumTimeToNow(holidayFrist, nowDate);
                    tipsArr.push(`âąçĽĺ¤§ĺŽśĺććĺżŤďź`);
                    tipsArr.push(`* ${legalName}ćžĺ: çŹŹ${holidayDiff+1}ĺ¤Š `)
                    if(legalFreeway == 1){
                        tipsArr.push(`* ĺ¨ĺ˝éŤééčĄ: ĺč´š \n`)
                    }else{
                        tipsArr.push(`* ĺ¨ĺ˝éŤééčĄ: ćśč´š \n`)
                    }
                }
            }

            if(legalRepair != 0){
                let existRepair = legalRepair.includes(currentMDDate);
                if(existRepair){
                    tipsArr.push(`đäťĺ¤Š${legalName}čĄĽç­ďźĺŞĺĺˇĽä˝ďź\n `);
                }
            }

            // čŽĄçŽĺˇŽĺź - äżŽĺ¤čˇ¨ĺš´éŽé˘
            let targetArr = legalDate.split('-');
            let month = targetArr[0];
            let day = targetArr[1];

            // ĺĺťşä¸ä¸Şĺ˝ĺĺš´äť˝çćĽć
            let curYearDate = new Date(currentYear, parseInt(month) - 1, parseInt(day));
            let now = new Date(nowDate);

            // čŽĄçŽä¸ä¸ä¸ŞčĺćĽćĽć
            let nextLegalDate;
            if (curYearDate >= now) {
                // ĺŚćäťĺš´çčĺćĽčżć˛Ąčżďźĺ°ąćŻäťĺš´ç
                nextLegalDate = `${currentYear}-${month}-${day}`;
            } else {
                // ĺŚćäťĺš´çčĺćĽĺˇ˛çťčżäşďźĺ°ąćŻćĺš´ç
                nextLegalDate = `${currentYear + 1}-${month}-${day}`;
            }

            // čŽĄçŽĺ¤Šć°ĺˇŽ
            let diffTime = calendar.diffTimeToDaily(nowDate, nextLegalDate);

            // çĄŽäżdiffTimećŻéč´ć°
            diffTime = Math.max(0, diffTime);

            if (diffTime == 0) {
                var obj = {todayName:legalName,todayDate:'', todayContent:''};
                todayArr.push(obj);
            } else {
                if (tempTime == 0) {
                    tempName = legalName;
                    tempTime = diffTime;
                } else if (diffTime > 0 && diffTime < tempTime) {
                    tempName = legalName;
                    tempTime = diffTime;
                }
            }

            // ĺććç¤şéťčžäżćä¸ĺ
            let startYearLegalDate = nowDate;
            let endYearLegalDate = nowDate;
            let startLegalHoliday = legalHoliday[0];
            let endLegalHoliday = legalHoliday[legalHoliday.length - 1];

            let legalHolidayNum = legalHoliday.length;
            if (diffTime + legalHolidayNum < 15) {
                let legalHolidayNum = legalHoliday.length;
                if (legalHolidayNum == 1) {
                    tipsArr.push(`âłčˇçŚť${legalName}ćžĺčżć${diffTime}ĺ¤Š `);
                    let startYearLegalDate = currentYear + '-' + startLegalHoliday;
                    let startDate = new Date(startYearLegalDate);

                    // ĺŚćĺźĺ§ćĽćĺˇ˛çťčżĺťďźä˝żç¨ä¸ä¸ĺš´ç
                    if (startDate < now) {
                        startYearLegalDate = (currentYear + 1) + '-' + startLegalHoliday;
                    }

                    if(legalFreeway == 1){
                        tipsArr.push(`* éŤééčĄ: ĺč´š`)
                    }else{
                        tipsArr.push(`* éŤééčĄ: ćśč´š`)
                    }

                    if (legalRepair != 0) {
                        let legalRepairNum = legalRepair.length;
                        tipsArr.push(`* čĄĽç­${legalRepairNum}ĺ¤Š: ${legalRepair.join('ă')}`)
                    }

                    if (legalHolidayNum > 2){
                        tipsArr.push(`* ĺć${legalHolidayNum}ĺ¤Š: ${startLegalHoliday} ~ ${endLegalHoliday}\n`)
                    }else{
                        tipsArr.push(`* ĺć${legalHolidayNum}ĺ¤Š: ${legalHoliday.join('ă')}\n`)
                    }

                } else if (!existHoliday){
                    let startYearLegalDate = currentYear + '-' + startLegalHoliday;
                    let startDate = new Date(startYearLegalDate);

                    // ĺŚćĺźĺ§ćĽćĺˇ˛çťčżĺťďźä˝żç¨ä¸ä¸ĺš´ç
                    if (startDate < now) {
                        startYearLegalDate = (currentYear + 1) + '-' + startLegalHoliday;
                    }

                    let startDiffTime = calendar.diffTimeToDaily(nowDate, startYearLegalDate);
                    startDiffTime = Math.max(0, startDiffTime);

                    if (startDiffTime > 0){
                        tipsArr.push(`âłčˇçŚť${legalName}ćžĺčżć${startDiffTime}ĺ¤Š`)
                        if(legalFreeway == 1){
                            tipsArr.push(`* éŤééčĄ: ĺč´š`)
                        }else{
                            tipsArr.push(`* éŤééčĄ: ćśč´š`)
                        }

                        if (legalRepair != 0) {
                            let legalRepairNum = legalRepair.length;
                            tipsArr.push(`* čĄĽç­${legalRepairNum}ĺ¤Š: ${legalRepair.join('ă')}`)
                        }

                        if (legalHolidayNum > 2){
                            tipsArr.push(`* ĺć${legalHolidayNum}ĺ¤Š: ${startLegalHoliday} ~ ${endLegalHoliday}\n`)
                        }else{
                            tipsArr.push(`* ĺć${legalHolidayNum}ĺ¤Š: ${legalHoliday.join('ă')}\n`)
                        }
                    }
                }
            }

        }

        var obj = {tempName:tempName,tempTime:tempTime};
        latelyArr.push(obj);
    }
};

//ĺ¤çćłĺŽčĺćĽ
// const handleLegalDate = (nowDate, currentMDDate, currentYear, todayArr, latelyArr, tipsArr) => {
//     let legalArr = daily.legal;
//     if(legalArr.length > 0){
//         let tempName = '';
//         let tempTime = 0;
//         for (let i = 0; i < legalArr.length; i++) {
//             const element = legalArr[i];
//             let legalName = element.name;
//             let legalDate = element.date;
//             let legalFreeway = element.freeway;
//             let legalHoliday = element.holiday;
//             let legalRepair = element.repair;
//             var existHoliday = false;
//             //čĄĽç­ććžĺćç¤ş
//             if(legalHoliday != 0){
//                 existHoliday = legalHoliday.includes(currentMDDate);
//                 if(existHoliday){
//                     let holidayFrist =currentYear + '-'+ legalHoliday[0];
//                     let holidayDiff = calendar.sumTimeToNow(holidayFrist, nowDate);
//                     tipsArr.push(`âąçĽĺ¤§ĺŽśĺććĺżŤďź`);
//                     tipsArr.push(`* ${legalName}ćžĺ: çŹŹ${holidayDiff+1}ĺ¤Š `)
//                     if(legalFreeway == 1){
//                         tipsArr.push(`* ĺ¨ĺ˝éŤééčĄ: ĺč´š \n`)
//                     }else{
//                         tipsArr.push(`* ĺ¨ĺ˝éŤééčĄ: ćśč´š \n`)
//                     }
//                 }
//             }
//             if(legalRepair != 0){
//                 let existRepair = legalRepair.includes(currentMDDate);
//                 if(existRepair){
//                     tipsArr.push(`đäťĺ¤Š${legalName}čĄĽç­ďźĺŞĺĺˇĽä˝ďź\n `);
//                 }
//             }

//             //čŽĄçŽĺˇŽĺź
//             let targetArr = legalDate.split('-');
//             let currentYearBar = currentYear + '-';
//             let nextLegalDate = currentYearBar + targetArr[0] + '-' + targetArr[1];
//             if (new Date(nowDate) > new Date(nextLegalDate)) {
//                 nextLegalDate = currentYear + 1 + '-' + targetArr[0] + '-' + targetArr[1];
//             }
//             let diffTime = calendar.diffTimeToDaily(nowDate, nextLegalDate);
//             if (diffTime == 0) {
//                 var obj = {todayName:legalName,todayDate:'', todayContent:''};
//                 todayArr.push(obj);
//             } else {
//                 if (tempTime == 0) {
//                     tempName = legalName;
//                     tempTime = diffTime;
//                 } else if (diffTime > 0&&diffTime < tempTime) {
//                     tempName = legalName;
//                     tempTime = diffTime;
//                 }
//             }

//             let startYearLegalDate = nowDate;
//             let endYearLegalDate = nowDate;
//             let startLegalHoliday = legalHoliday[0];
//             let endLegalHoliday = legalHoliday[legalHoliday.length - 1];

//             let legalHolidayNum = legalHoliday.length;
//             if (diffTime+legalHolidayNum < 15) {
//                 let legalHolidayNum = legalHoliday.length;
//                 if (legalHolidayNum == 1) {
//                     tipsArr.push(`âłčˇçŚť${legalName}ćžĺčżć${diffTime}ĺ¤Š `);
//                     startYearLegalDate = currentYearBar + startLegalHoliday;
//                     if (new Date(nowDate) > new Date(startYearLegalDate)) {
//                         startYearLegalDate = currentYear + 1 + '-' + startLegalHoliday;
//                     }
//                     if(legalFreeway == 1){
//                         tipsArr.push(`* éŤééčĄ: ĺč´š`)
//                     }else{
//                         tipsArr.push(`* éŤééčĄ: ćśč´š`)
//                     }

//                     if (legalRepair != 0) {
//                         let legalRepairNum = legalRepair.length;
//                         tipsArr.push(`* čĄĽç­${legalRepairNum}ĺ¤Š: ${legalRepair.join('ă')}`)
//                     }

//                     if (legalHolidayNum > 2){
//                         tipsArr.push(`* ĺć${legalHolidayNum}ĺ¤Š: ${startLegalHoliday} ~ ${endLegalHoliday}\n`)
//                     }else{
//                         tipsArr.push(`* ĺć${legalHolidayNum}ĺ¤Š: ${legalHoliday.join('ă')}\n`)
//                     }

//                 } else if (!existHoliday){
//                     startYearLegalDate = currentYearBar + startLegalHoliday;
//                     endYearLegalDate = currentYearBar + endLegalHoliday;
//                     let startDiffTime = calendar.diffTimeToDaily(nowDate, startYearLegalDate);
//                     if (startDiffTime > 0){
//                         tipsArr.push(`âłčˇçŚť${legalName}ćžĺčżć${startDiffTime}ĺ¤Š`)
//                         if(legalFreeway == 1){
//                             tipsArr.push(`* éŤééčĄ: ĺč´š`)
//                         }else{
//                             tipsArr.push(`* éŤééčĄ: ćśč´š`)
//                         }

//                         if (legalRepair != 0) {
//                             let legalRepairNum = legalRepair.length;
//                             tipsArr.push(`* čĄĽç­${legalRepairNum}ĺ¤Š: ${legalRepair.join('ă')}`)
//                         }

//                         if (legalHolidayNum > 2){
//                             tipsArr.push(`* ĺć${legalHolidayNum}ĺ¤Š: ${startLegalHoliday} ~ ${endLegalHoliday}\n`)
//                         }else{
//                             tipsArr.push(`* ĺć${legalHolidayNum}ĺ¤Š: ${legalHoliday.join('ă')}\n`)
//                         }
//                     }
//                 }
//             }

//         }

//         var obj = {tempName:tempName,tempTime:tempTime};
//         latelyArr.push(obj);
//     }
// };

//ĺ¤çé´ĺčćĽ
const handleLFtvDate = (nowDate, currentYear, todayArr, latelyArr) => {
    let lFtvArr = daily.lFtv;
    if(lFtvArr.length > 0){
        let tempName = '';
        let tempTime = 0;
        for (let i = 0; i < lFtvArr.length; i++) {
            const element = lFtvArr[i];
            let lFtvName = element.name;
            let lFtvDate = element.date;

            //N+1ĺš´
            let nextlFtvYearDate = (currentYear+1) + '-' + lFtvDate;
            let nextlFtvSolarDate = calendar.conversion(nextlFtvYearDate);
            let reslFtvSolarDate = nextlFtvSolarDate;

            //Nĺš´
            let curlFtvYearDate = currentYear + '-' + lFtvDate;
            let curlFtvSolarDate = calendar.conversion(curlFtvYearDate);
            if (new Date(nowDate) <= new Date(curlFtvSolarDate)){
                reslFtvSolarDate = curlFtvSolarDate;
            }

            //N-1ĺš´
            let prelFtvYearDate = (currentYear-1) + '-' + lFtvDate;
            let prelFtvSolarDate = calendar.conversion(prelFtvYearDate);
            if (new Date(nowDate) <= new Date(prelFtvSolarDate)){
                reslFtvSolarDate = prelFtvSolarDate;
            }

            //čŽĄçŽĺˇŽĺź
            let diffTime = calendar.diffTimeToDaily(nowDate, reslFtvSolarDate);
            if (diffTime == 0) {
                var obj = {todayName:lFtvName,todayDate:'', todayContent:''};
                todayArr.push(obj);
            }else{
                if (tempTime == 0){
                    tempName = lFtvName;
                    tempTime = diffTime;
                }else if (diffTime > 0&&diffTime < tempTime){
                    tempName = lFtvName;
                    tempTime = diffTime;
                }
            }
        }
        var obj = {tempName:tempName,tempTime:tempTime};
        latelyArr.push(obj);
    }
};

//ĺ¤çäşĺĺčć°
const handleTermDate = (nowDate, currentYear, todayArr, latelyArr) => {
    let termArr = daily.term;
    if(termArr.length > 0){
        let tempName = '';
        let tempTime = 0;
        let tempSort = 0;
        for (let i = 0; i < termArr.length; i++) {
            const element = termArr[i];
            let termSort = element.sort;
            let termName = element.name;
            let termMonth = element.month;

            //çšćŽĺ¤ç
            let termSortStr;
            if(termSort <= 22){
                termSortStr = termSort + 2;
            }else{
                termSortStr = termSort - 22;
            }

            //N+1ĺš´
            let nextTermSolarDate = calendar.conversionTerm(currentYear+1, termMonth, termSortStr);
            let resTermSolarDate = nextTermSolarDate;

            //Nĺš´
            let curTermSolarDate = calendar.conversionTerm(currentYear, termMonth, termSortStr);
            if (new Date(nowDate) <= new Date(curTermSolarDate)){
                resTermSolarDate = curTermSolarDate;
            }

            //N-1ĺš´
            let preTermSolarDate = calendar.conversionTerm(currentYear-1, termMonth, termSortStr);
            if (new Date(nowDate) <= new Date(preTermSolarDate)){
                resTermSolarDate = preTermSolarDate;
            }

            //čŽĄçŽĺˇŽĺź
            let diffTime = calendar.diffTimeToDaily(nowDate, resTermSolarDate);
            if (diffTime == 0) {
                var obj = {todayName:termName,todayDate:'', todayContent:''};
                todayArr.push(obj);
            }else{
                if (tempTime == 0){
                    tempSort = termSort;
                    tempName = termName;
                    tempTime = diffTime;
                }else if (diffTime > 0&&diffTime < tempTime){
                    tempSort = termSort;
                    tempName = termName;
                    tempTime = diffTime;
                }
            }
        }

        tempName = 'çŹŹ'+tempSort+'ä¸Şčć°'+tempName;
        var obj = {tempName:tempName,tempTime:tempTime};
        latelyArr.push(obj);
    }
};

//ĺ¤çĺ˝éčćĽ
const handleInternationDate = (nowDate, currentYear, todayArr, latelyArr) => {
    let internationArr = daily.internation;
    if(internationArr.length > 0) {
        let tempName = '';
        let tempTime = 0;
        for (let i = 0; i < internationArr.length; i++) {
            const element = internationArr[i];
            let internationArrName = element.name;
            let internationArrDate = element.date;
            let targetArr = internationArrDate.split('-');
            let nextInternationArrDate = currentYear + '-' + targetArr[0] + '-' + targetArr[1];
            if (new Date(nowDate) > new Date(nextInternationArrDate)) {
                nextInternationArrDate = currentYear + 1 + '-' + targetArr[0] + '-' + targetArr[1];
            }
            //čŽĄçŽĺˇŽĺź
            let diffTime = calendar.diffTimeToDaily(nowDate, nextInternationArrDate);
            if (diffTime == 0) {
                var obj = {todayName: internationArrName, todayDate: '', todayContent: ''};
                todayArr.push(obj);
            } else {
                if (tempTime == 0) {
                    tempName = internationArrName;
                    tempTime = diffTime;
                } else if (diffTime > 0&&diffTime < tempTime) {
                    tempName = internationArrName;
                    tempTime = diffTime;
                }
            }
        }

        var obj = {tempName:tempName,tempTime:tempTime};
        latelyArr.push(obj);
    }
};

//ĺ¤çéłĺčćĽ
const handleSFtvDate = (nowDate, currentYear, todayArr, intAllArr) => {
    let sFtvArr = daily.sFtv;
    if(sFtvArr.length > 0){
        let tempName = '';
        let tempTime = 0;
        for (let i = 0; i < sFtvArr.length; i++) {
            const element = sFtvArr[i];
            let sFtvName = element.name;
            let sFtvDate = element.date;
            let targetArr = sFtvDate.split('-');
            let nextSFtvDate = currentYear+'-'+ targetArr[0]+'-'+targetArr[1];
            if (new Date(nowDate) > new Date(nextSFtvDate)){
                nextSFtvDate = currentYear+1+'-'+ targetArr[0]+'-'+targetArr[1];
            }
            //čŽĄçŽĺˇŽĺź
            let diffTime = calendar.diffTimeToDaily(nowDate, nextSFtvDate);
            if (diffTime == 0) {
                var obj = {todayName:sFtvName,todayDate:'', todayContent:''};
                todayArr.push(obj);
            }else{
                if (tempTime == 0){
                    tempName = sFtvName;
                    tempTime = diffTime;
                }else if (diffTime > 0&&diffTime < tempTime){
                    tempName = sFtvName;
                    tempTime = diffTime;
                }
            }
        }

        var obj = {tempName: tempName, tempTime: tempTime};
        intAllArr.push(obj);
    }
};

//ĺ¤ççšćŽčćĽ
const handleSpecialDate = (nowDate, currentYear, todayArr, intAllArr) => {
    let specialArr = daily.special;
    if(specialArr.length > 0){
        let tempName = '';
        let tempTime = 0;
        for (let i = 0; i < specialArr.length; i++) {
            const element = specialArr[i];
            let specialName = element.name;
            let specialDate = element.date;
            let targetArr = specialDate.split('/');
            let specialMonth = targetArr[0];
            let specialWeek = targetArr[1];
            let specialNums = targetArr[2];
            let specialSolarDate = calendar.conversionParentDate(currentYear, specialMonth, specialWeek, specialNums);
            let nextSpecialSolarDate = specialSolarDate;
            if (new Date(nowDate) > new Date(nextSpecialSolarDate)){
                nextSpecialSolarDate = calendar.conversionParentDate(currentYear+1, specialMonth, specialWeek, specialNums);
            }
            //čŽĄçŽĺˇŽĺź
            let diffTime = calendar.diffTimeToDaily(nowDate, nextSpecialSolarDate);
            if (diffTime == 0) {
                var obj = {todayName:specialName,todayDate:'', todayContent:''};
                todayArr.push(obj);
            }else{
                if (tempTime == 0){
                    tempName = specialName;
                    tempTime = diffTime;
                }else if (diffTime > 0&&diffTime < tempTime){
                    tempName = specialName;
                    tempTime = diffTime;
                }
            }
        }
        var obj = {tempName:tempName,tempTime:tempTime};
        intAllArr.push(obj);
    }
};

//čˇĺĺ¤ć´ťč
const getEasterDate = (year) => {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    let easterDates = new Date(year, month - 1, day); // ćł¨ćďźćäť˝ćŻ 0 ç´˘ĺźďź3 čĄ¨ç¤ş 4 ć
    let easterYear = easterDates.getFullYear();
    let easterMonth = easterDates.getMonth();
    let easterDate = easterDates.getDate();
    let easterDateStr = `${easterYear}-` + `${(easterMonth + 1) < 10 ? '0' + (easterMonth + 1) : (easterMonth + 1)}-${(easterDate) < 10 ? '0' + (easterDate) : (easterDate)}`;
    return easterDateStr;
};

//ĺ¤çĺ¤ć´ťč
const handleEasterDate = (nowDate, currentYear, todayArr, intAllArr) => {
    //ĺ¤ć´ťč
    //N+1ĺš´
    let nextEasterDate = getEasterDate(currentYear+1);
    let resEasterDate = nextEasterDate;

    //Nĺš´
    let curEasterDate = getEasterDate(currentYear);
    if (new Date(nowDate) <= new Date(curEasterDate)){
        resEasterDate = curEasterDate;
    }

    //N-1ĺš´
    let preEasterDate = getEasterDate(currentYear-1);
    if (new Date(nowDate) <= new Date(preEasterDate)){
        resEasterDate = preEasterDate;
    }

    //čŽĄçŽĺˇŽĺź
    let diffTime = calendar.diffTimeToDaily(nowDate, resEasterDate);
    if (diffTime == 0) {
        var obj = {todayName:`ĺ¤ć´ťč`,todayDate:'', todayContent:''};
        todayArr.push(obj);
    }else{
        var obj = {tempName:`ĺ¤ć´ťč`,tempTime:diffTime};
        intAllArr.push(obj);
    }
};

// ĺ¨ handleLegalDate ĺ˝ć°ĺćˇťĺ äťĽä¸ĺ˝ć°

// ĺ¤çä¸äźĺ¤Š
const handleSanFuDate = (nowDate, currentYear, tipsArr) => {
    let date = new Date(nowDate);

    // čŽĄçŽĺ¤ĺ­Łä¸äźĺ¤Šçĺźĺ§ćĽćăçťććĽćĺćçť­ĺ¤Šć°
    let sanFuDates = calendar.calculateSanFuDates(currentYear);
    if (sanFuDates) {
        let tipContentStr = "";
        sanFuDates.forEach(function (sanFuDate) {
            let sanFuStartDateStr = formatDate(sanFuDate.startDate);
            let diffTime = calendar.diffTimeToDaily(nowDate, sanFuStartDateStr);

            // ćĽčżä¸äźĺ¤Š
            date.setHours(0, 0, 0, 0);
            if (date >= sanFuDate.startDate && date <= sanFuDate.endDate) {
                let sanFudays = calendar.sumTimeToNow(sanFuStartDateStr, nowDate);
                tipContentStr = `đĺ¤ĺ­Łä¸äźĺ¤Š-ă${sanFuDate.name}ăçŹŹ${sanFudays+1}ĺ¤ŠďźčŻˇĺ¤§ĺŽśćł¨ćéżćă\n`;
            } else if (tipContentStr === "" && diffTime > 0 && diffTime < 8) {
                tipContentStr = `âłčˇçŚťĺ¤ĺ­Łä¸äźĺ¤Š-ă${sanFuDate.name}ăčżć${diffTime}ĺ¤Šďźćçť­${sanFuDate.days}ĺ¤Šďź${formatMMDate(sanFuDate.startDate)} ~ ${formatMMDate(sanFuDate.endDate)}ďź\n`;
            }
        });

        if (tipContentStr.length > 0) {
            tipsArr.push(tipContentStr);
        }
    }
};

// ĺ¤çĺäšĺ¤Š
const handleSiJiuDate = (nowDate, currentYear, tipsArr) => {
    let date = new Date(nowDate);

    // čˇĺäťĺš´ĺĺťĺš´çĺŹčłćĽć
    let dongzhiDateThisYear = calendar.conversionTerm(currentYear, "12", 24);
    let dongzhiDateLastYear = calendar.conversionTerm(currentYear - 1, "12", 24);

    // čŽĄçŽäťĺš´ĺĺťĺš´çĺŹĺ­Łĺäšĺ¤Šçĺźĺ§ćĽćăçťććĽć
    let sijiuDatesThisYear = calendar.calculateSanjiuSeason(currentYear, new Date(dongzhiDateThisYear));
    let sijiuDatesLastYear = calendar.calculateSanjiuSeason(currentYear - 1, new Date(dongzhiDateLastYear));

    let allSijiuDates = sijiuDatesLastYear.concat(sijiuDatesThisYear);

    if (allSijiuDates) {
        let tipContentStr = "";
        allSijiuDates.forEach(function (sijiuDate) {
            let sijiuStartDate = formatMMDate(sijiuDate.startDate);
            let sijiuEndDate = formatMMDate(sijiuDate.endDate);

            // čˇ¨ĺš´ĺ¤ç
            let sijiuStartDateStr = sijiuDate.startDate.getFullYear() + '-' + sijiuStartDate;
            let sijiuEndDateStr = sijiuDate.endDate.getFullYear() + '-' + sijiuEndDate;

            let diffTime = calendar.diffTimeToDaily(nowDate, sijiuStartDateStr);

            // ćĽčżĺäšĺ¤Š
            date.setHours(0, 0, 0, 0);
            let sijiuStartDateObj = new Date(sijiuStartDateStr).setHours(0, 0, 0, 0);
            let sijiuEndDateObj = new Date(sijiuEndDateStr).setHours(0, 0, 0, 0);

            if (date >= sijiuStartDateObj && date <= sijiuEndDateObj) {
                let sijiudays = calendar.sumTimeToNow(sijiuStartDateStr, nowDate);
                tipContentStr = `âĺŹĺ­Łĺäšĺ¤Š-ă${sijiuDate.name}ăçŹŹ${sijiudays + 1}ĺ¤Šďźä¸äšäşäšä¸ĺşćďźä¸äšĺäšĺ°ä¸čľ°ďźčŻˇĺ¤§ĺŽśćł¨ćäżćă\n`;
            } else if (tipContentStr === "" && diffTime > 0 && diffTime < 8) {
                tipContentStr = `âłčˇçŚťĺŹĺ­Łĺäšĺ¤Š-ă${sijiuDate.name}ăčżć${diffTime}ĺ¤Šďźćçť­9ĺ¤Šďź${sijiuStartDateStr} ~ ${sijiuEndDateStr}ďź\n`;
            }
        });

        if (tipContentStr.length > 0) {
            tipsArr.push(tipContentStr);
        }
    }
};

// ĺ¤çć˘é¨ĺ­Ł
const handleMeiYuDate = (nowDate, currentYear, tipsArr) => {
    let date = new Date(nowDate);

    // čç§ćĽć
    let mangZhongDate = calendar.conversionTerm(currentYear, "06", 11);
    // ĺ°ććĽć
    let xiaoshuDate = calendar.conversionTerm(currentYear, "07", 13);

    // čŽĄçŽć˘é¨ĺ­Łçĺźĺ§ćĽćăçťććĽćĺćçť­ĺ¤Šć°
    let meiYuSeason = calendar.calculateMeiYuSeason(currentYear, new Date(mangZhongDate), new Date(xiaoshuDate));

    if (meiYuSeason) {
        let tipContentStr = "";
        let meiYuStartDateStr = formatDate(meiYuSeason.startDate);
        let meiYuEndDateStr = formatDate(meiYuSeason.endDate);
        let diffTime = calendar.diffTimeToDaily(nowDate, meiYuStartDateStr);

        date.setHours(0, 0, 0, 0);
        if (date >= meiYuSeason.startDate && date <= meiYuSeason.endDate) {
            let meiYudays = calendar.sumTimeToNow(meiYuStartDateStr, nowDate);
            let meiYuEndDays = calendar.sumTimeToNow(meiYuEndDateStr, nowDate);
            tipContentStr = `đ§ć˘é¨ĺ­ŁçŹŹ${meiYudays+1}ĺ¤Šďźé´é¨ćçť­čżçťľďźéŤć¸ŠéŤćšżďźčˇçŚťĺşć˘čżć${meiYuEndDays+1}ĺ¤Šă\n`;
        } else if (diffTime > 0 && diffTime < 8) {
            tipContentStr = `âłčˇçŚťć˘é¨ĺ­Łčżć${diffTime}ĺ¤Šďźćçť­${meiYuSeason.duration}ĺ¤Šďź${formatMMDate(meiYuSeason.startDate)} ~ ${formatMMDate(meiYuSeason.endDate)}ďź\n`;
        }

        if (tipContentStr.length > 0) {
            tipsArr.push(tipContentStr);
        }
    }
};

// ćˇťĺ ćĽćć źĺźĺčžĺŠĺ˝ć°
const formatDate = (date) => {
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, '0');
    let day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatMMDate = (date) => {
    let month = String(date.getMonth() + 1).padStart(2, '0');
    let day = String(date.getDate()).padStart(2, '0');
    return `${month}-${day}`;
};

//ĺ¤çčŻäťśććć
const handleLicenseDate = (nowDate, currentYear, todayLicenseArr, endLicenseArr) => {
    let licenseArr = daily.license;
    if(licenseArr.length > 0){
        for (let i = 0; i < licenseArr.length; i++) {
            const element = licenseArr[i];
            let licenseName = element.name;
            let licenseDate = element.date;
            if (new Date(nowDate) <= new Date(licenseDate)){
                //čŽĄçŽĺˇŽĺź
                let diffTime = calendar.diffTimeToDaily(nowDate, licenseDate);
                if (diffTime < 31){
                    if(diffTime == 0){
                        todayLicenseArr.push(`Âˇ ${licenseName}đ¨ \n äťĺ¤Šĺ°ćďźčŻˇĺ°˝ĺżŤĺ¤ç\n`);
                    }else{
                        let todayDate = '<'+licenseDate.split('-').join('.')+'>';
                        todayLicenseArr.push(`Âˇ ${licenseName}đ¨ \n ${todayDate} \n ${diffTime}ĺ¤Šĺĺ°ćďźčŻˇĺćśĺ¤ç\n`);
                    }
                }else{
                    endLicenseArr.push(`Âˇ ${licenseName}: ${diffTime}ĺ¤Š`);
                }
            }
        }
    }
};

//ćĺčĄ¨ĺ¤çä¸şĺ­çŹŚä¸˛
module.exports = handleTimeList = (opts = {}) => {
    return new Promise(async (resolve, reject) => {
        try {
            //ĺĺŽšć°çť
            let content = []
            let contentArr = []
            let todayArr = []
            let latelyArr = []
            let intAllArr = []
            let tipsArr = []
            let todayLicenseArr = []
            let endLicenseArr = []

            //ćäťćĽćĽćč˝Źä¸şYYYY-MM-DDçć źĺź çŹŹä¸ĺ¤Š
            let date = new Date();
            let currentYear = date.getFullYear();
            let currentMonth = date.getMonth();
            let currentDate = date.getDate();
            let currentMDDate = `${(currentMonth + 1) < 10 ? '0' + (currentMonth + 1) : (currentMonth + 1)}-${(currentDate) < 10 ? '0' + (currentDate) : (currentDate)}`;
            let nowDate = `${currentYear}-${currentMDDate}`;

            let lunarDate = calendar.solar2lunar();

            //ĺ˝ĺ¤Šé´ĺĺĺ˝ĺĺ¤Šć°
            handleFestivalSolarDate(nowDate, lunarDate, currentYear, content);

            //çşŞĺżľćĽ
            handleAnniversaryDate(nowDate, currentYear, todayArr, latelyArr);

            //çćĽ
            handleBirthdayDate(nowDate, lunarDate, currentYear, todayArr, latelyArr);

            //ćłĺŽčĺćĽ
            handleLegalDate(nowDate, currentMDDate, currentYear, todayArr, latelyArr, tipsArr);

            //é´ĺčćĽ
            handleLFtvDate(nowDate, currentYear, todayArr, latelyArr);

            //äşĺĺčć°
            handleTermDate(nowDate, currentYear, todayArr, latelyArr);

            //ĺ˝éčćĽ
            handleInternationDate(nowDate, currentYear, todayArr, latelyArr);

            //éłĺčćĽ
            handleSFtvDate(nowDate, currentYear, todayArr, intAllArr);

            //çšćŽčćĽ
            handleSpecialDate(nowDate, currentYear, todayArr, intAllArr);

            //ĺ¤çĺ¤ć´ťč
            handleEasterDate(nowDate, currentYear, todayArr, intAllArr);

            //ĺ¤ć´ťčăçšćŽčćĽĺéłĺčćĽĺĺšś
            if(intAllArr.length > 0) {
                // ćžĺ°tempTimećĺ°çĺŻščąĄĺšśćžĺĽć°ć°çť
                const minObj = intAllArr.reduce((prev, curr) => {
                    return curr.tempTime < prev.tempTime ? curr : prev;
                });

                latelyArr.push(minObj);
            }

            // ć˘é¨ĺ­Ł
            handleMeiYuDate(nowDate, currentYear, tipsArr);

            // ĺ¤ĺ­Łä¸äźĺ¤Š
            handleSanFuDate(nowDate, currentYear, tipsArr);

            // ĺŹĺ­Łĺäšĺ¤Š
            handleSiJiuDate(nowDate, currentYear, tipsArr);

            //čŻäťśććć
            handleLicenseDate(nowDate, currentYear, todayLicenseArr, endLicenseArr);

            content.push(`đéčŚčćĽ \n`);

            //ćčżçčćĽćäťćĽçčćĽ
            if(todayArr.length > 0){
                let todayTempArr = [];
                for (var i = 0; i < todayArr.length; i++) {
                    let todayName = todayArr[i].todayName;
                    let todayDate = todayArr[i].todayDate;
                    let todayContent = todayArr[i].todayContent;
                    if (todayName != ''&&todayDate != ''&&todayContent != ''){
                        todayTempArr.push(`äťĺ¤ŠćŻ${todayName}đ \n${todayContent} ${todayDate} \n`);
                    }else if (todayName != ''&&todayDate != ''){
                        todayTempArr.push(`äťĺ¤ŠćŻ${todayName}đ \n${todayContent} \n`);
                    }else if (todayName != ''){
                        todayTempArr.push(`äťĺ¤ŠćŻ${todayName}đ \n`);
                    }
                }
                todayTempArr.sort((a, b) => a.length - b.length);
                content = content.concat(todayTempArr);
                //éćşçŹčŻ
                //const res = await axios.get('https://api.uomg.com/api/comments.163?format=json')
                //content.push(`${res.data.data.content} \n-- ćĽčŞ@${res.data.data.nickname}ă${res.data.data.name}ă${res.data.data.artistsname}\n`)
            }

            //let filteredArr = latelyArr.filter(item => item['tempTime'] !== 0);
            let minTempTime = Math.min.apply(Math, latelyArr.map(item => { return item['tempTime'] }));

            let minTempArr = [];
            for (var j = 0; j < latelyArr.length; j++) {
                let tempName = latelyArr[j].tempName;
                let tempTime = latelyArr[j].tempTime;
                if (minTempTime == latelyArr[j].tempTime){
                    minTempArr.push(`* ${tempName}: ${tempTime}ĺ¤Š`);
                }else{
                    contentArr.push(`Âˇ ${tempName}: ${tempTime}ĺ¤Š`);
                }
            }

            if (minTempArr.length > 0){
                content.push(`đčˇçŚťä¸ä¸ä¸ŞčćĽ`);
                minTempArr.sort((a, b) => a.length - b.length);
                minTempArr[minTempArr.length-1] = minTempArr[minTempArr.length-1] + '\n';
                content = content.concat(minTempArr);
            }


            //čžĺşčĄĽç­/ćžĺć¸ŠéŚ¨ćç¤ş
            if(tipsArr.length > 0){
                for (var i = 0; i < tipsArr.length; i++) {
                    content.push(tipsArr[i]);
                }
            }

            //čžĺşĺĺŽšćéżĺşŚćĺş
            if(contentArr.length > 0) {
                let tempContentArr = [];
                for (var i = 0; i < contentArr.length; i++) {
                    tempContentArr.push(contentArr[i]);
                }
                tempContentArr.sort((a, b) => calendar.getTextLength(a) - calendar.getTextLength(b));
                content = content.concat(tempContentArr);
            }

            //ç´ŻčŽĄćçąĺ¤Šć°
            if(loveContent != undefined) {
                content.push(loveContent);
            }

            let licenseContentArr = [];
            licenseContentArr.push(`\nđłčŻäťśććć \n`);
            if (todayLicenseArr.length > 0) {
                todayLicenseArr.sort((a, b) => calendar.getTextLength(a) - calendar.getTextLength(b));
                licenseContentArr = licenseContentArr.concat(todayLicenseArr);
            }
            if(endLicenseArr.length > 0) {
                endLicenseArr.sort((a, b) => calendar.getTextLength(a) - calendar.getTextLength(b));
                licenseContentArr = licenseContentArr.concat(endLicenseArr);
            }
            const licenseContent = licenseContentArr.join('\n');

            const contentForMqtt = content.join('\n');
            const contentStr = contentForMqtt + '\n' + licenseContent;

            console.log('čˇĺéčŚčćĽćĺ\n', contentStr);
            await sendMqttMsg(contentForMqtt, licenseContent);
            const hasNearLicense = todayLicenseArr.length > 0;
            const hasNearFestival = latelyArr.length > 0 && minTempTime < 8;
            if (opts.returnMeta) resolve({ content: contentForMqtt, licenseContent, hasNearLicense, hasNearFestival });
            else resolve(contentForMqtt);
        } catch (error) {
            reject(error.message || error)
        }
    })

}
