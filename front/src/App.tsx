import axios from 'axios';

let ACCESS_TOKEN: string;

axios.interceptors.request.use((config) => {
  console.log('OK -> Request interceptor: ', config);

  if (ACCESS_TOKEN) {
    config.headers = {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    };
  }

  return config;
});

axios.interceptors.response.use(
  (response) => {
    console.log('OK -> Response interceptor: ', response);

    return response;
  },
  async (error) => {
    if (axios.isAxiosError(error)) {
      console.log('ERROR -> response interceptor: ', error.response);

      if (error.response?.data.type === 'TokenExpired') {
        const response = await axios.post('/api/refreshToken');

        ACCESS_TOKEN = response.data.accessToken;

        return await axios(error.config);
      }
    }

    return Promise.reject(error);
  }
);

function App() {
  const handleLogin = async () => {
    try {
      const response = await axios.post<{
        accessToken: string;
        expiresIn: number;
      }>('/api/generateToken');

      ACCESS_TOKEN = response.data.accessToken;
      console.log('OK -> login: ', response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log('ERROR -> login: ', error.response);
      }
    }
  };

  const handlePost = async () => {
    try {
      const response = await axios.post<{ email: string }>(
        '/api/needTokenForThis'
      );

      console.log('OK -> need token: ', response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log('ERROR -> need token: ', error.response);
      }
    }
  };

  const handleRefresh = async () => {
    try {
      const response = await axios.post<{
        accessToken: string;
        expiresIn: number;
      }>('/api/refreshToken');

      ACCESS_TOKEN = response.data.accessToken;
      console.log('REFRESH TOKEN -> response: ', response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log('REFRESH TOKEN -> error: ', error.response);
      }
    }
  };

  return (
    <div className="App">
      <button onClick={handleLogin}>login</button>
      <button onClick={handlePost}>POST</button>
      <button onClick={handleRefresh}>REFRESH TOKEN</button>
    </div>
  );
}

export default App;
