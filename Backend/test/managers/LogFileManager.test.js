const chai = require('chai');
const expect = chai.expect;
const logFileManager = require('../../server/managers/LogFileManager');

describe('LogFileManager.cleanLine', () => {
    it('Simple Case', async () => {
        const line = '[2021-09-17T10:30:02.282] [ERROR] health - No data 1715 SLOTT A Slottsviken A 35197 2021-06-01';

        const cleanLine = await logFileManager.cleanLine( line );

        expect(cleanLine).to.equal('10:30 No data 1715 SLOTT A Slottsviken A 35197 2021-06-01');

    });
});
