'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Legend,
} from 'recharts';
import { Switch } from '@/components/ui/switch';
import { useSession } from 'next-auth/react';

export default function Dashboard() {
  // actual role
  const { data: session, status } = useSession();
  const userInfo = session?.user;

  const [role, setRole] = useState(userInfo.role);
  const [showAdminDasboard, setShowAdminDashboard] = useState(false);

  const [dummyCount, setDummyCount] = useState();

  const data = {
    admin: {
      stats: [
        { name: 'Total Users', value: 2450 },
        { name: 'New Users (30d)', value: 320 },
        { name: 'Total Quizzes Taken', value: 13420 },
        { name: 'Quizzes Created (30d)', value: 560 },
      ],
      monthlyGrowth: [
        { month: 'Apr', users: 2300, quizzes: 1200 },
        { month: 'May', users: 2800, quizzes: 2500 }, // big spike
        { month: 'Jun', users: 2100, quizzes: 1400 }, // sharp drop
        { month: 'Jul', users: 3200, quizzes: 3000 }, // huge jump
        { month: 'Aug', users: 2600, quizzes: 1800 }, // dip again
      ],
    },
  };

  const [topicAccuracyData, setTopicAccuracyData] = useState([]);
  const [monthlyQuizData, setMonthyQuizData] = useState([]);
  const [websiteData, setWebsiteData] = useState({});

  useEffect(() => {
    fetchTopicAccuracy();
    getMonthlyQuizReport();

    if (role == "admin") {
      getWebsiteStats();
    }
  }, [])

  const fetchTopicAccuracy = async () => {
    try {
      const res = await fetch('/api/quiz/topicAccuracy');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to fetch topic Accuracy');
      }

      // this logic creates adds some dummy data to have 3 categories in total for the radarchart
      const radarChartData = [...data.accuracy];
      const numberOfDummy = 3 - data.accuracy.length;
      setDummyCount(numberOfDummy);

      if (numberOfDummy > 0) {
        for (let i = 0; i < numberOfDummy; i++) {
          radarChartData.push({ category: `topic ${i}`, accuracy: 0 })
        }
      }

      setTopicAccuracyData(radarChartData);

    } catch (err) {
      console.error('fetch topic accuracy', err);
    }
  }

  const getMonthlyQuizReport = async () => {
    try {
      const res = await fetch('/api/quiz/monthlyQuizAttempt');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to fetch monthly quiz report');
      }

      setMonthyQuizData(data.quizHistory);

    } catch (err) {
      console.error('fetch monthly quiz Report', err);
    }
  }

  const getWebsiteStats = async () => {
    try {
      const res = await fetch('/api/websiteStats');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to fetch website states');
      }

      setWebsiteData(data);
      console.log(data);

    } catch (err) {
      console.error('fetch website states', err);
    }
  }


  return (
    <section className="space-y-8 overflow-hidden">
      {/* Header with Role Switch */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold bg-clip-text">
          {showAdminDasboard ? 'Admin Dashboard' : 'User Dashboard'}
        </h1>
        {
          role === "admin" &&
          <div className="flex items-center gap-2">
            <span>User</span>
            <Switch
              checked={showAdminDasboard}
              onCheckedChange={checked => setShowAdminDashboard(checked)}
            />
            <span>Admin</span>
          </div>
        }
      </div>


      {
        showAdminDasboard ?
          // Admin Dashboard
          (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Stats Cards */}
              <div className="grid md:grid-cols-4 gap-6">
                {websiteData?.stats.map((stat, idx) => (
                  <Card key={idx} className="hover:shadow-xl transition">
                    <CardHeader>
                      <CardTitle>{stat.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-bold">
                      {stat.value}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Growth Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>📈 Monthly Growth Overview</CardTitle>
                  <p className="text-sm text-gray-500">
                    Users & Quizzes growth in the last 4 months
                  </p>
                </CardHeader>
                <CardContent className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={websiteData?.monthlyGrowth}
                      margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="10%"
                            stopColor="#6366f1"
                            stopOpacity={0.8}
                          />
                          <stop offset="90%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient
                          id="colorQuizzes"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="10%"
                            stopColor="#ec4899"
                            stopOpacity={0.8}
                          />
                          <stop offset="90%" stopColor="#ec4899" stopOpacity={0} />
                        </linearGradient>
                      </defs>

                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" tick={{ fill: '#6b7280' }} />
                      <YAxis tick={{ fill: '#6b7280' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          borderRadius: '10px',
                          border: '1px solid #e5e7eb',
                        }}
                        labelStyle={{ fontWeight: 'bold', color: '#374151' }}
                      />
                      <Legend verticalAlign="top" height={36} />

                      <Line
                        type="monotone"
                        dataKey="users"
                        stroke="#6366f1"
                        strokeWidth={3}
                        dot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 8 }}
                        fill="url(#colorUsers)"
                        fillOpacity={1}
                      />

                      <Line
                        type="monotone"
                        dataKey="quizzes"
                        stroke="#ec4899"
                        strokeWidth={3}
                        dot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 8 }}
                        fill="url(#colorQuizzes)"
                        fillOpacity={1}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          )
          :
          // User Dashboard
          (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >

              {/* Quiz History */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Quiz History</CardTitle>
                </CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyQuizData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="quizzes" fill="#82ca9d" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Accuracy Radar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    Topic Accuracy
                    {dummyCount < 0 && <span className='text-xs font-normal'> (Works best if you have attempted 3 or more category quizzes)</span>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={topicAccuracyData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="category" />
                      <Radar
                        dataKey="accuracy"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.6}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>

                </CardContent>
              </Card>
            </motion.div>
          )
      }
    </section>
  );
}
