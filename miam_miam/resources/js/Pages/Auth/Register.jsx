import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        nom: '',
        prenom: '',
        telephone: '',
        localisation: '',
        code_parrain: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="nom" value="Nom" />

                    <TextInput
                        id="nom"
                        name="nom"
                        value={data.nom}
                        className="mt-1 block w-full"
                        autoComplete="family-name"
                        isFocused={true}
                        onChange={(e) => setData('nom', e.target.value)}
                        required
                    />

                    <InputError message={errors.nom} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="prenom" value="Prénom" />

                    <TextInput
                        id="prenom"
                        name="prenom"
                        value={data.prenom}
                        className="mt-1 block w-full"
                        autoComplete="given-name"
                        onChange={(e) => setData('prenom', e.target.value)}
                        required
                    />

                    <InputError message={errors.prenom} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="telephone" value="Téléphone" />

                    <TextInput
                        id="telephone"
                        type="tel"
                        name="telephone"
                        value={data.telephone}
                        className="mt-1 block w-full"
                        autoComplete="tel"
                        onChange={(e) => setData('telephone', e.target.value)}
                        required
                    />

                    <InputError message={errors.telephone} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="localisation" value="Localisation" />

                    <TextInput
                        id="localisation"
                        name="localisation"
                        value={data.localisation}
                        className="mt-1 block w-full"
                        autoComplete="address-level2"
                        onChange={(e) => setData('localisation', e.target.value)}
                        required
                    />

                    <InputError message={errors.localisation} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="code_parrain" value="Code Parrain (optionnel)" />

                    <TextInput
                        id="code_parrain"
                        name="code_parrain"
                        value={data.code_parrain}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('code_parrain', e.target.value)}
                    />

                    <InputError message={errors.code_parrain} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Mot de passe" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirmer le mot de passe"
                    />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        required
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <Link
                        href={route('login')}
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Déjà inscrit ?
                    </Link>

                    <PrimaryButton className="ms-4" disabled={processing}>
                        S'inscrire
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}