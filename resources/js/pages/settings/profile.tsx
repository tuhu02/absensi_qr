import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import React from 'react';

import DeleteUser from '@/components/student/delete-user';
import Heading from '@/components/student/heading';
import InputError from '@/components/student/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/student-layout';
import SettingsLayout from '@/layouts/settings/layout';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import type { BreadcrumbItem } from '@/types';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

type StudentProfile = {
    gender?: string | null;
    date_of_birth?: string | null;
};

type AuthUser = {
    name?: string | null;
    email?: string | null;
    address?: string | null;
    email_verified_at?: string | null;
    student?: StudentProfile | null;
};

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage().props as unknown as {
        auth: {
            user: AuthUser;
        };
    };

    const [gender, setGender] = React.useState(auth.user.student?.gender ?? '');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile Settings</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Profile information"
                        description="Update your profile information"
                    />

                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>

                                    <Input
                                        id="name"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.name ?? ''}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder="Full name"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email address</Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.email ?? ''}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder="Email address"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.email}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="gender">Gender</Label>

                                    <Select
                                        value={gender}
                                        onValueChange={setGender}
                                    >
                                        <SelectTrigger
                                            id="gender"
                                            className="w-full"
                                        >
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem value="male">
                                                Male
                                            </SelectItem>
                                            <SelectItem value="female">
                                                Female
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <input
                                        type="hidden"
                                        name="gender"
                                        value={gender}
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.gender}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="date_of_birth">
                                        Date of birth
                                    </Label>

                                    <Input
                                        id="date_of_birth"
                                        type="date"
                                        className="mt-1 block w-full"
                                        defaultValue={
                                            auth.user.student?.date_of_birth ??
                                            ''
                                        }
                                        name="date_of_birth"
                                        autoComplete="bday"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.date_of_birth}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="address">Address</Label>

                                    <Input
                                        id="address"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.address ?? ''}
                                        name="address"
                                        autoComplete="street-address"
                                        placeholder="Your address"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.address}
                                    />
                                </div>

                                {mustVerifyEmail &&
                                    auth.user.email_verified_at === null && (
                                        <div>
                                            <p className="-mt-4 text-sm text-muted-foreground">
                                                Your email address is
                                                unverified.{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                >
                                                    Click here to resend the
                                                    verification email.
                                                </Link>
                                            </p>

                                            {status ===
                                                'verification-link-sent' && (
                                                <div className="mt-2 text-sm font-medium text-green-600">
                                                    A new verification link has
                                                    been sent to your email
                                                    address.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                {status ===
                                    'email-changed-verification-sent' && (
                                    <div className="rounded-md bg-blue-50 p-4 text-sm">
                                        <p className="font-medium text-blue-900">
                                            Email berhasil diganti! 📧
                                        </p>
                                        <p className="mt-1 text-blue-800">
                                            Silakan cek email Anda untuk
                                            memverifikasi alamat email baru.
                                            Link verifikasi berlaku selama 60
                                            menit.
                                        </p>
                                    </div>
                                )}

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                    >
                                        Save
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">
                                            Saved
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
