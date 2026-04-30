'use client';

import * as React from 'react';
import {
    GraduationCap,
    Shield,
    UserCog,
    Users,
    Book,
    BookOpen,
    PieChart,
} from 'lucide-react';

import { NavMain } from '@/components/lecturer/nav-main';
import { NavUser } from '@/components/lecturer/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from '@/components/ui/sidebar';
import { usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/student/app-logo-icon';
import { Nav } from '@/components/lecturer/nav';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { url, props: pageProps } = usePage();
    const user = pageProps.auth?.user;
    const data = {
        user: {
            name: user.name,
            email: user.email,
            avatar: '/avatars/shadcn.jpg',
        },

        nav: [
            {
                title: 'Dashboard',
                url: '/lecturer/dashboard',
                icon: PieChart,
                isActive: url.startsWith('/lecturer/dashboard'),
            },
        ],

        navMain: [
            {
                title: 'Akademik',
                url: '/lecturer/classes',
                icon: BookOpen,
                items: [
                    {
                        title: 'Kelas Saya',
                        url: '/lecturer/classes',
                        isActive: url.startsWith('/lecturer/classes'),
                    },
                    {
                        title: 'Absensi',
                        url: '/lecturer/attendance',
                        isActive: url.startsWith('/lecturer/attendance'),
                    },
                    {
                        title: 'Laporan',
                        url: '/lecturer/reports',
                        isActive: url.startsWith('/lecturer/reports'),
                    },
                ],
            },
        ],
    };

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <div className="flex items-center gap-2 px-2 py-2">
                    <AppLogoIcon className="h-10 w-10" />
                    <span className="font-semibold">Absensi</span>
                </div>
            </SidebarHeader>
            <Nav items={data.nav}></Nav>
            <SidebarContent>
                <NavMain items={data.navMain} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
