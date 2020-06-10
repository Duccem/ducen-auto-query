import consulter, { Consulter } from './index';
import incons from 'mysql2/node_modules/iconv-lite';
incons.encodingExists('foo');

let consult: Consulter;

describe('Consulter', () => {
	beforeAll(() => {
		consult = consulter({
			host: 'localhost',
			database: 'farmacia',
			password: '2423503',
			user: 'root',
		});
	});
	it('Should be a Consulter object', () => {
		expect(consult).toBeInstanceOf(Consulter);
	});
	it('Should be the first company data', async () => {
		let getData = await consult.get('adm_empresa', '1');
		expect(getData.id).toBe(1);
	});

	afterAll(async () => {
		await consult.endConnection();
	});
});
