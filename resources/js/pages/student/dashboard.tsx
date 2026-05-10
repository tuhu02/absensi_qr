import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/student-layout';
import type { BreadcrumbItem, Course } from '@/types';
import student from '@/routes/student';

import {
    CalendarCheck,
    ClipboardList,
    UserMinus,
    BarChart3,
    Clock,
    MapPin,
    ArrowRight,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Beranda',
        href: '/student/dashboard',
    },
];

type DashboardProps = {
    todayCourses: Course[];
    tomorrowCourses: Course[];
    today: string;
    tomorrow: string;
};

export default function Dashboard() {
    const pageProps = usePage<Partial<DashboardProps> & { auth?: any }>().props;
    const {
        auth,
        todayCourses = [],
        tomorrowCourses = [],
        today = '',
        tomorrow = '',
    } = pageProps;

    const userName = auth?.user?.name
        ? auth.user.name.split(' ')[0]
        : 'Mahasiswa';

    const chartData = [
        { name: 'Jan', kehadiran: 85 },
        { name: 'Feb', kehadiran: 92 },
        { name: 'Mar', kehadiran: 88 },
        { name: 'Apr', kehadiran: 95 },
        { name: 'Mei', kehadiran: 90 },
        { name: 'Jun', kehadiran: 98 },
    ];

    const stats = [
        {
            label: 'Total Kehadiran',
            value: '92%',
            icon: CalendarCheck,
            color: 'bg-sky-50 text-sky-600',
        },
        {
            label: 'Izin / Sakit',
            value: '2 Hari',
            icon: ClipboardList,
            color: 'bg-sky-50 text-sky-600',
        },
        {
            label: 'Alfa',
            value: '1',
            icon: UserMinus,
            color: 'bg-sky-50 text-sky-600',
        },
    ];

    const hasTodayCourses = todayCourses.length > 0;
    const scheduleTitle = hasTodayCourses ? 'Jadwal Hari Ini' : 'Jadwal Besok';
    const scheduleDate = hasTodayCourses ? today : tomorrow;
    const scheduleCourses = hasTodayCourses ? todayCourses : tomorrowCourses;
    const scheduleBadge = hasTodayCourses ? 'Hari Ini' : 'Besok';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Absensi" />

            <div className="flex h-full flex-1 flex-col gap-6 bg-[#F8FAFC] p-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Selamat Datang, {userName}! 👋
                    </h1>
                    <p className="text-sm text-slate-500">
                        Ringkasan aktivitas dan jadwal absensi Anda.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="rounded-3xl border border-sky-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:shadow-md"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`rounded-xl p-3 ${stat.color}`}>
                                    <stat.icon className="size-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                                        {stat.label}
                                    </p>
                                    <p className="text-2xl font-black text-slate-900">
                                        {stat.value}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid flex-1 gap-6 lg:grid-cols-3">
                    <div className="rounded-4xl border border-sky-100 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:col-span-2">
                        <div className="mb-8 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="rounded-lg bg-sky-50 p-2">
                                    <BarChart3 className="size-5 text-sky-600" />
                                </div>
                                <h2 className="text-lg font-bold text-slate-800">
                                    Statistik Kehadiran
                                </h2>
                            </div>
                        </div>
                        <div className="h-75 w-full overflow-hidden">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={chartData}
                                    margin={{
                                        top: 10,
                                        right: 10,
                                        left: -20,
                                        bottom: 20,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="#f1f5f9"
                                    />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fill: '#94a3b8',
                                            fontSize: 12,
                                            fontWeight: 600,
                                        }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{
                                            borderRadius: '16px',
                                            border: 'none',
                                            boxShadow:
                                                '0 10px 15px -3px rgba(0,0,0,0.1)',
                                            padding: '12px',
                                        }}
                                    />
                                    <Bar
                                        dataKey="kehadiran"
                                        radius={[10, 10, 10, 10]}
                                        barSize={40}
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={
                                                    index ===
                                                    chartData.length - 1
                                                        ? '#0ea5e9'
                                                        : '#bae6fd'
                                                }
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6 rounded-4xl border border-sky-100 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <div>
                            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
                                <Clock className="size-5 text-sky-600" />
                                Jadwal Hari Ini
                                <span className="text-sm font-normal text-slate-400">
                                    ({today})
                                </span>
                            </h2>
                            <div className="flex flex-col gap-3">
                                {todayCourses.length > 0 ? (
                                    todayCourses.map((item) => (
                                        <div
                                            key={item.id}
                                            className="rounded-2xl border border-slate-50 bg-slate-50/50 p-4"
                                        >
                                            <div className="mb-2 flex items-start justify-between">
                                                <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-600 uppercase">
                                                    Hari Ini
                                                </span>
                                                <span className="text-xs font-semibold text-slate-400">
                                                    {item.start_time?.slice(
                                                        0,
                                                        5,
                                                    )}{' '}
                                                    -{' '}
                                                    {item.end_time?.slice(0, 5)}
                                                </span>
                                            </div>
                                            <h3 className="mb-2 leading-tight font-bold text-slate-800">
                                                {item.name}
                                            </h3>
                                            <div className="flex items-center gap-1 text-xs text-slate-500">
                                                <MapPin className="size-3" />
                                                {item.classroom?.location
                                                    ?.name &&
                                                item.classroom?.name
                                                    ? `${item.classroom.location.name} - ${item.classroom.name}`
                                                    : (item.classroom?.name ??
                                                      item.room ??
                                                      '-')}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="py-4 text-center text-sm text-slate-400">
                                        Tidak ada jadwal hari ini.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-slate-100" />

                        <div>
                            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
                                <Clock className="size-5 text-slate-400" />
                                Jadwal Besok
                                <span className="text-sm font-normal text-slate-400">
                                    ({tomorrow})
                                </span>
                            </h2>
                            <div className="flex flex-col gap-3">
                                {tomorrowCourses.length > 0 ? (
                                    tomorrowCourses.map((item) => (
                                        <div
                                            key={item.id}
                                            className="rounded-2xl border border-slate-50 bg-slate-50/50 p-4"
                                        >
                                            <div className="mb-2 flex items-start justify-between">
                                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 uppercase">
                                                    Besok
                                                </span>
                                                <span className="text-xs font-semibold text-slate-400">
                                                    {item.start_time?.slice(
                                                        0,
                                                        5,
                                                    )}{' '}
                                                    -{' '}
                                                    {item.end_time?.slice(0, 5)}
                                                </span>
                                            </div>
                                            <h3 className="mb-2 leading-tight font-bold text-slate-800">
                                                {item.name}
                                            </h3>
                                            <div className="flex items-center gap-1 text-xs text-slate-500">
                                                <MapPin className="size-3" />
                                                {item.classroom?.location
                                                    ?.name &&
                                                item.classroom?.name
                                                    ? `${item.classroom.location.name} - ${item.classroom.name}`
                                                    : (item.classroom?.name ??
                                                      item.room ??
                                                      '-')}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="py-4 text-center text-sm text-slate-400">
                                        Tidak ada jadwal besok.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
