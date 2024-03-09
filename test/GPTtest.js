const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

// Import your Express app
const app = require('../express_server'); // Replace '../express_server' with the correct path to your Express server file

chai.use(chaiHttp);

describe('GET /', () => {
  const agent = chai.request.agent(app);

  it('should redirect to /login with status code 302', () => {
    return agent
      .get('/')
      .then((res) => {
        expect(res).to.redirect;
        expect(res.redirects[0]).to.equal('http://127.0.0.1:8081/login');
      });
  });

  it('should redirect to /login with status code 302', () => {
    return agent
      .get('/urls/new')
      .then((res) => {
        expect(res).to.redirect;
        expect(res.redirects[0]).to.equal('http://127.0.0.1:8081/login');
      });
  });

  it('should return status code 404', () => {
    return agent
      .get('/urls/NOTEXISTS')
      .then((res) => {
        expect(res).to.have.status(404);
      });
  });

  it('should return status code 403', () => {
    return agent
      .get('/urls/b2xVn2')
      .then((res) => {
        expect(res).to.have.status(403);
      });
  });

  after(() => {
    agent.close();
  });
});