import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '20s', target: 5 },
    { duration: '20s', target: 10 },
    { duration: '20s', target: 15 },
  ],
};

export default function () {
  const url = 'https://dev-backend.tradersalloy.com/api/user/login';
  const payload = JSON.stringify({
    email: 'yunayamda3@gmail.com',
    password: 'asdfasdf',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(url, payload, params);

  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);
}