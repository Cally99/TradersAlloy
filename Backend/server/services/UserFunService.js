


module.exports = {
    // TODO: IS ANY OF THIS USED ??? UserFunService
    listFriends(user_id) {
        return userFunManager.listFriends(user_id);
    },

    addFriend(req, res) {
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
        return UserResearch
            .update({is_shared: true},
                {where: { insref: req.body.insref, user_id: req.body.user_id },
                returning: true,
            }).then(ur => {
                return UserFriend.findAll({where: {  "user_id": req.body.user_id }})
                    .then(friends => {
                        emailer.invitationEmail(friends)
                    })
                    .catch(err => res.status(400).send(err))
            }).catch((error) => res.status(400).send(error));
    },

    history(req, res) {
        console.log(' selecting  User GRAPH');
        return User.findById(1), {include: [UserTrade]}
            .then(u => { res.status(200).send(u);})
            .catch(error => res.status(400).send('** User GRAPH: '+error));
    },


}
