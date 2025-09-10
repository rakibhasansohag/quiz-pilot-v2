'use client';

import {
  BarChart2,
  CircleFadingPlus,
  Clipboard,
  FilePlus,
  History,
  LayoutDashboard,
  Trophy,
  User,
  Users,
} from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { Separator } from './ui/separator';
import { useSession } from 'next-auth/react';

const navDetails = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard, // main dashboard
  },
  {
    title: 'Profile',
    url: '/dashboard/profile',
    icon: User, //  for personal profile
  },
  {
    title: 'Quiz History',
    url: '/dashboard/quiz-history',
    icon: History, // past attempts
  },

  {
    title: 'Leaderboard',
    url: '/dashboard/leaderboard',
    icon: Trophy, // ranking
  },
];

const adminNavDetails = [
  {
    title: 'Users',
    url: '/dashboard/admin/users',
    icon: Users, // manage users
  },
  {
    title: 'Category',
    url: '/dashboard/admin/categories',
    icon: CircleFadingPlus, // add new category
  },
  {
    title: 'Questions',
    url: '/dashboard/admin/questions',
    icon: Clipboard, // exam/tests
  },
];

export function AppSidebar({ ...props }) {
  const { data: session, status } = useSession();

  const userInfo = session?.user;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenuButton
          size="lg"
          className="hover:cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Link href="/">
            <div className="flex items-center gap-2 mx-auto md:mx-0">
              <div className="text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <img
                  src="https://res.cloudinary.com/dlrzwaoga/image/upload/v1757071182/vnixltocrqshrhu3l22t.png"
                  className="size-8"
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight ">
                <span className="truncate font-extrabold text-xl font-delius-regular">
                  QuizPilot
                </span>
              </div>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarHeader>

      <Separator />

      <SidebarContent>
        <NavMain
          userRole={userInfo.role}
          navDetails={navDetails}
          adminNavDetails={adminNavDetails}
        />
      </SidebarContent>

      <SidebarFooter>
        <NavUser userInfo={userInfo} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
