import https from 'https';

export function request(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (resp: any) => {
        let data = '';

        resp.on('data', (chunk: any) => {
          data += chunk;
        });

        resp.on('end', () => {
          resolve(data);
        });
      })
      .on('error', (err: any) => {
        console.log('Error: ' + err.message);
        reject(err.message);
      });
  });
}