const userFunService = require("../services/UserFunService.js");

const log4js = require('log4js');
const logger = log4js.getLogger("app_log");


module.exports = {

    async listFriends(req, res) {
        try {
            const result = await userFunService.listFriends(req.params.user_id);
            res.status(200).send(result);
        } catch(error) {
            logger.error(error.message);
            res.status(400).send(error);
        }
    },

    async addFriend(req, res) {
        var data = req.body
        return User.findAll()
            .then(users => {
                for (var i=0; i<users.length; i++) {
                    if (users[i].email == data.friend_email) {
                        data.status = 'accepted'
                    }
                }

                return UserFriend.create(data)
                    .then(friend => {
                        res.status(200).send(friend)
                    })
                    .catch(error => console.log(error))
            })
            .catch(err => console.log(err))
    },

    userResearchShare(req, res) {
        return UserResearch.update(
                                {is_shared: true},
                                {where: { insref: req.body.insref, user_id: req.body.user_id },
                            returning: true})
            .then( ur => {
                return UserFriend.findAll(
                            {where: {  "user_id": req.body.user_id }})
                    .then( friends => {
                        emailer.invitationEmail(friends)
                    })
                    .catch(err => res.status(400).send(err))})
            .catch( error => res.status(400).send(error));
    },

    // addFriend_back(req, res) {
    //     let user_id = req.body.user_id;
    //     let friend_email = req.body.friend_email;

    //     return User.findByPk(user_id)
    //         .then(u =>  {

    //             return User.findOne({ where: {email: friend_email}})  // find an existing user
    //                 .then(u2 =>  {
    //                     return UserFriend.create({
    //                         user_id,
    //                         status: 'ok',
    //                         friend_email: friend_email
    //                     }).then(uf => {
    //                         res.status(200).send(uf)
    //                     }).catch(error => res.status(400).send('** User Friend add: '+error))
    //                 })
    //                 .catch((error) => {  // invite a NEW user to the system, send an email with this user.id, user.email to friend_email and
    //                     // Send email  and hopefully they create a user account
    //                     console.log('sending: '+friend_email+', '+u.email);
    //                     let emailBody = '<table style="color:white;font-size:2rem;width:100%;background:linear-gradient(130deg, #19c6ca, #1e6dca);height:120px;"><tr><td><img  width="100px" src="https://rapportkollen.se/images/traders-alloy-logo_icon-white-transparent.png">Rapportkollen</td></tr></table>';
    //                     emailBody += '<h2 style="color:#444455;">You have been invited by '+ u.email +'</h2>'+' to join Rapportkollen and see their company fundamental research. ';
    //                     emailBody += '<a href="'+Server_address+'/api/create_account_by_invitation/'+friend_email+'" style="text-decoration:none;"><span style="padding:4px 10px;margin:20px;background:#FFCA28;border:1px solid #FFB300;">SKAPA KONTO</span></a><br/>'
    //                     emailBody += '<table style="margin-top:30px;color:white;font-size:1.2rem;width:100%;background:#444455;height:120px;"><tr><td>&nbsp;<br/><br/><br/><br/></td></tr></table>';

    //                     console.log('to: '+friend_email);

    //                     let email = {
    //                         from: 'Petter Hattenbach <me@samples.mailgun.org>',   // What are the rules for setting this ?
    //                         to: friend_email,
    //                         subject: 'Invitation from '+u.email ,
    //                         html: emailBody
    //                     };
    //                     console.log('sending a invitation email to new user');
    //                     mailgun.messages().send(email, (error, body) => {
    //                         if (error) {
    //                             console.log("got an error: ", error);
    //                         } else {
    //                             console.log('*** MailGun: Create User account by invitation');
    //                         }
    //                     });
    //                     console.log('sent');
    //                     return UserFriend.create({
    //                         user_id,
    //                         status: 'invited',
    //                         friend_email: friend_email
    //                     }).then( uf => {
    //                         res.status(200).send(uf)
    //                     }).catch((error) => {
    //                         res.status(400).send('** User Friend add: '+error)
    //                     })
    //                 })
    //         })
    //         .catch(error => {
    //             console.log('----------- failed badly to send a friend request');
    //             res.status(400).send('** User Friend add: '+error)
    //         });
    // },

    history(req, res) {
        console.log(' selecting  User GRAPH');
        return User.findById(1), {include: [UserTrade]}
            .then(u => { res.status(200).send(u);})
            .catch(error => res.status(400).send('** User GRAPH: '+error));
    },

    // getTradePlans(req, res) {
    //     return UserTradePlan.findAll({where: [{user_id: req.body.user_id}, {insref: req.body.insref}]})
    //         .then(plan => {
    //             if (!plan) {
    //                 return res.status(404).send({ message: 'No Trade plan found for this user on insref'})
    //             }else {
    //                 return res.status(200).send(plan)
    //             }})
    //         .catch((error) => res.status(400).send(error))
    // },
    // setTradePlan(req, res) {
    //     return UserWatchlistItem.findOne({ where: { insref: req.body.insref, user_id: req.body.user_id } })
    //         .then(u => {
    //             if (u) {
    //                 return UserWatchlistItem
    //                     .update({
    //                         plan_target_price: req.body.target_price,
    //                         plan_entry_price: req.body.entry_price,
    //                         plan_stoploss_price: req.body.stoploss_price
    //                     }, {
    //                         where: { insref: req.body.insref, user_id: req.body.user_id }
    //                     })
    //                     .then(() => {
    //                         res.status(200).send(u)
    //                     })
    //                     .catch((error) => res.status(400).send(error));
    //             } else {
    //                 res.status(400).send(error)
    //             }

    //         })
    //         .catch((error) => res.status(400).send(error));
    // },

}
