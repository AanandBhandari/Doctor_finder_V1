const CronJob = require("cron").CronJob;
const OPD = require("../models/OPD");
const Timemanage = require("../models/Timemanage");
const Appointment = require("../models/Appointment")
module.exports = () => {
    new CronJob(
        "0 55 23 * * *",
        async function () {
            console.log("clearing past OPD schedule, Time manage, appointment..every midnight", new Date());
            // let today = new Date().toISOString().split('T')[0]


            // let opds = await OPD.updateMany({ enddate: today },{"$set":{isAvailable:false}},{new:true})
            // if (opds) {
            //     console.log('----opds---');
            //     console.log(opds);
            // }


            // let appointments = await Appointment.updateMany({ date: today},{"$set":{status:'expire'}},{new:true})
            // if(appointments){
            //     console.log('----appointment----');
            //     console.log(appointments);
            // }

            // let timeManage = await Timemanage.find({ "bookedTime.date": today })
            // for (let i = 0; i < timeManage.length; i++) {
            //     const element = timeManage[i];
            //     for (let j = 0; j < element.bookedTime.length; j++) {
            //         const bt = element.bookedTime[j];
            //         if (bt.date.toISOString().split('T')[0] === today) {
            //             for (let k = 0; k < bt.availabletimeslot.length; k++) {
            //                 if (bt.availabletimeslot[k] === 0) {
            //                     console.log(bt.availabletimeslot[k]);
            //                     bt.availabletimeslot.set(k, null)
            //                 }

            //             }
            //         }

            //     }

            //     await element.save()
            // }
            // //
            // console.log('---timemanage----');
            // console.log(timeManage);

        },
        null,
        true,
        "Asia/Katmandu"
    );
}