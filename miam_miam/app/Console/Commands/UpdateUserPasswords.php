<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UpdateUserPasswords extends Command
{
    protected $signature = 'db:update-passwords';
    protected $description = 'Mettre à jour les mots de passe des utilisateurs avec de vrais hashs';

    public function handle()
    {
        $this->info('Mise à jour des mots de passe des utilisateurs...');

        try {
            // Mettre à jour les mots de passe avec de vrais hashs
            $users = [
                'admin@zeducspace.com' => 'admin123',
                'gerant@zeducspace.com' => 'gerant123',
                'jean.pierre@zeducspace.com' => 'employe123',
                'marie.claire@zeducspace.com' => 'employe123',
                'kouam.jean@student.ucac-icam.cm' => 'student123',
                'ngo.marie@student.ucac-icam.cm' => 'student123',
                'fotso.paul@student.ucac-icam.cm' => 'student123',
                'tchoumi.grace@student.ucac-icam.cm' => 'student123',
                'mballa.david@student.ucac-icam.cm' => 'student123',
                'ngono.sarah@student.ucac-icam.cm' => 'student123',
                'tchakounte.junior@student.ucac-icam.cm' => 'student123',
                'nguema.patricia@student.ucac-icam.cm' => 'student123',
            ];

            foreach ($users as $email => $password) {
                $hashedPassword = Hash::make($password);
                
                $updated = DB::table('users')
                    ->where('email', $email)
                    ->update(['mot_de_passe' => $hashedPassword]);

                if ($updated) {
                    $this->info("✅ Mot de passe mis à jour pour: {$email}");
                } else {
                    $this->warn("⚠️ Utilisateur non trouvé: {$email}");
                }
            }

            $this->info('✅ Tous les mots de passe ont été mis à jour !');
            $this->info('');
            $this->info('🔑 Vous pouvez maintenant vous connecter avec :');
            $this->info('- tchoumi.grace@student.ucac-icam.cm / student123');
            $this->info('- kouam.jean@student.ucac-icam.cm / student123');
            $this->info('- admin@zeducspace.com / admin123');
            $this->info('- gerant@zeducspace.com / gerant123');
            
            return 0;

        } catch (\Exception $e) {
            $this->error('Erreur lors de la mise à jour : ' . $e->getMessage());
            return 1;
        }
    }
}