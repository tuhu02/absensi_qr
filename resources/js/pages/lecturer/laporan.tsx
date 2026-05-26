import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/lecturer-layout';
import {
    BarChart3,
    Clock,
    MapPin,
    ArrowUpRight,
    Users,
    CheckCircle2,
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

const chartData = [
    { name: 'Web Prog', kehadiran: 96 },
    { name: 'Basis Data', kehadiran: 92 },
    { name: 'Jaringan', kehadiran: 90 },
    { name: 'AI', kehadiran: 95 },
    { name: 'PBO', kehadiran: 97 },
];

const todayClasses = [
    {
        id: 1,
        subject: 'Pemrograman Web',
        time: '08:00 - 10:30',
        room: 'Lab Terpadu 1',
        status: 'active',
    },
    {
        id: 2,
        subject: 'Kecerdasan Buatan',
        time: '13:00 - 15:30',
        room: 'Ruang Kuliah 2.1',
        status: 'upcoming',
    },
];

const recentActivities = [
    {
        id: 1,
        text: 'Absensi Pemrograman Web — Pertemuan 10 disimpan',
        time: '2 jam lalu',
        color: 'bg-sky-400',
    },
    {
        id: 2,
        text: '3 mahasiswa Basis Data diberi izin hadir',
        time: 'Kemarin',
        color: 'bg-teal-400',
    },
    {
        id: 3,
        text: 'Laporan kehadiran kelas AI diekspor',
        time: '2 hari lalu',
        color: 'bg-amber-400',
    },
    {
        id: 4,
        text: 'Jadwal PBO pertemuan 11 diperbarui',
        time: '3 hari lalu',
        color: 'bg-sky-400',
    },
];

const stats = [
    {
        label: 'Kelas Diampu',
        value: '5',
        icon: BarChart3,
        colorClass: 'bg-sky-50 text-sky-600',
    },
    {
        label: 'Total Mahasiswa',
        value: '180',
        icon: Users,
        colorClass: 'bg-teal-50 text-teal-600',
    },
    {
        label: 'Rata-rata Kehadiran',
        value: '94%',
        icon: CheckCircle2,
        colorClass: 'bg-amber-50 text-amber-600',
    },
];

export default function Dashboard() {
    const { auth } = usePage().props as any;
    const firstName = auth?.user?.name?.split(' ')[0] ?? 'Dosen';

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="flex min-h-full w-full flex-col gap-6 bg-slate-50 p-6">
                <div>
                    <h1 className="text-xl font-semibold text-slate-900">
                        Selamat datang, {firstName}
                    </h1>
                    <p className="mt-0.5 text-sm text-slate-500">
                        Ringkasan aktivitas mengajar dan statistik kelas Anda
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {stats.map((s) => (
                        <div
                            key={s.label}
                            className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-5"
                        >
                            <div className={`rounded-lg p-2.5 ${s.colorClass}`}>
                                <s.icon className="size-5" />
                            </div>
                            <div>
                                <p className="text-[11px] font-medium tracking-widest text-slate-400 uppercase">
                                    {s.label}
                                </p>
                                <p className="text-2xl font-semibold text-slate-900">
                                    {s.value}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="rounded-xl border border-slate-100 bg-white p-6 lg:col-span-2">
                        <p className="mb-4 text-[11px] font-medium tracking-widest text-slate-400 uppercase">
                            Kehadiran per kelas
                        </p>
                        <ResponsiveContainer width="100%" height={210}>
                            <BarChart
                                data={chartData}
                                margin={{
                                    top: 0,
                                    right: 0,
                                    left: -24,
                                    bottom: 0,
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
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    dy={8}
                                />
                                <YAxis
                                    domain={[80, 100]}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    formatter={(val) =>
                                        [`${val}%`, 'Kehadiran'] as [
                                            string,
                                            string,
                                        ]
                                    }
                                    contentStyle={{
                                        borderRadius: 12,
                                        border: 'none',
                                        boxShadow:
                                            '0 4px 20px rgba(0,0,0,0.08)',
                                        fontSize: 13,
                                    }}
                                />
                                <Bar
                                    dataKey="kehadiran"
                                    radius={[6, 6, 6, 6]}
                                    barSize={36}
                                >
                                    {chartData.map((_, i) => (
                                        <Cell
                                            key={i}
                                            fill={
                                                i === chartData.length - 1
                                                    ? '#0ea5e9'
                                                    : '#bae6fd'
                                            }
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-white p-6">
                        <p className="mb-4 flex items-center gap-1.5 text-[11px] font-medium tracking-widest text-slate-400 uppercase">
                            <Clock className="size-3.5" /> Jadwal hari ini
                        </p>
                        <div className="flex flex-col gap-3">
                            {todayClasses.map((cls) => (
                                <div
                                    key={cls.id}
                                    className="rounded-lg border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:border-sky-100 hover:bg-sky-50/50"
                                >
                                    <div className="mb-2 flex items-start justify-between">
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                                cls.status === 'active'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-slate-200 text-slate-500'
                                            }`}
                                        >
                                            {cls.status === 'active'
                                                ? 'Berlangsung'
                                                : 'Akan dimulai'}
                                        </span>
                                        <span className="text-[11px] text-slate-400">
                                            {cls.time}
                                        </span>
                                    </div>
                                    <p className="mb-3 text-sm font-medium text-slate-800">
                                        {cls.subject}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1 text-[11px] text-slate-500">
                                            <MapPin className="size-3" />{' '}
                                            {cls.room}
                                        </span>
                                        {cls.status === 'active' && (
                                            <button className="flex items-center gap-0.5 text-[11px] font-medium text-sky-600 transition-colors hover:text-sky-500">
                                                Input absensi{' '}
                                                <ArrowUpRight className="size-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="rounded-xl border border-slate-100 bg-white p-6">
                        <p className="mb-4 text-[11px] font-medium tracking-widest text-slate-400 uppercase">
                            Aktivitas terbaru
                        </p>
                        <div className="divide-y divide-slate-50">
                            {recentActivities.map((act) => (
                                <div
                                    key={act.id}
                                    className="flex items-center gap-3 py-3"
                                >
                                    <div
                                        className={`size-2 flex-shrink-0 rounded-full ${act.color}`}
                                    />
                                    <p className="flex-1 text-sm text-slate-700">
                                        {act.text}
                                    </p>
                                    <span className="text-[11px] whitespace-nowrap text-slate-400">
                                        {act.time}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-white p-6">
                        <p className="mb-4 text-[11px] font-medium tracking-widest text-slate-400 uppercase">
                            Performa kehadiran
                        </p>
                        <div className="flex flex-col gap-4">
                            {[...chartData]
                                .sort((a, b) => b.kehadiran - a.kehadiran)
                                .map((item) => (
                                    <div key={item.name}>
                                        <div className="mb-1.5 flex justify-between">
                                            <span className="text-sm text-slate-700">
                                                {item.name}
                                            </span>
                                            <span className="text-sm text-slate-500">
                                                {item.kehadiran}%
                                            </span>
                                        </div>
                                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className="h-full rounded-full bg-sky-400"
                                                style={{
                                                    width: `${item.kehadiran}%`,
                                                    opacity:
                                                        0.4 +
                                                        (item.kehadiran - 88) *
                                                            0.1,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
