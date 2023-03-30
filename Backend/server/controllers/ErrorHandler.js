module.exports = function ( businessLogicFunctionality ){
    return async (req, res, next) => {
        try {
            console.log('CALLED - ');
            console.log(businessLogicFunctionality);
            await businessLogicFunctionality(req, res);
            console.log('DONE');

        } catch ( error ) {
            console.log('log every error!');
            res.status(501).send({text: 'arghhhH!!!', type: 'error'});
            next( error );
        }

    }
}
