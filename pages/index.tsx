import { NextPage } from 'next';
import Head from 'next/head';
import MoodForm from '../components/MoodForm';

const Home: NextPage = () => {
  return (
    <div className="bg-gray-100 min-h-screen">
      <Head>
        <title>MoodPal</title>
      </Head>

      <header className="bg-white shadow p-4">
        <h1 className="text-gray-800 text-3xl font-semibold">MoodPal</h1>
      </header>
      <main className="container mx-auto px-4 py-12">
        <MoodForm />
      </main>
    </div>
  );
};

export default Home;

