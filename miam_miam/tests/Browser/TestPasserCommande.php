<?php

namespace Tests\Browser;

use Laravel\Dusk\Browser;
use Tests\DuskTestCase;
use App\Models\User;
use App\Models\Menu;
use App\Models\CategorieMenu;
use Illuminate\Foundation\Testing\RefreshDatabase;

class TestPasserCommande extends DuskTestCase
{
    use RefreshDatabase; // Pour s'assurer d'une base de données propre à chaque test

    /**
     * Test qu'un utilisateur peut s'inscrire, se connecter, commander un article et passer la commande.
     *
     * @return void
     */
    public function test_utilisateur_peut_sinscrire_se_connecter_commander_et_payer()
    {
        $this->browse(function (Browser $browser) {
            // Préparation des données de test
            $password = 'password123';
            $user = User::factory()->make([
                'password' => bcrypt($password),
            ]);

            $category = CategorieMenu::factory()->create();
            $menuItem = Menu::factory()->create([
                'id_categorie' => $category->id_categorie,
                'prix' => 10.00,
                'nom_article' => 'Pizza Test',
            ]);

            // 1. Inscription
            $browser->visit('/register') // Hypothèse: route /register
                    ->type('#name', $user->name) // Hypothèse: input avec id="name"
                    ->type('#email', $user->email) // Hypothèse: input avec id="email"
                    ->type('#password', $password) // Hypothèse: input avec id="password"
                    ->type('#password_confirmation', $password) // Hypothèse: input avec id="password_confirmation"
                    ->press('Register') // Hypothèse: bouton avec le texte "Register"
                    ->assertPathIs('/home'); // Hypothèse: redirection vers /home après inscription

            // 2. Déconnexion (pour tester la connexion séparément)
            // Cette étape est optionnelle et dépend de votre UI.
            // Si votre app React gère la déconnexion via un appel API sans rechargement de page,
            // cette partie pourrait être différente ou non nécessaire.
            $browser->clickLink('Logout') // Hypothèse: lien avec le texte "Logout"
                    ->assertPathIs('/'); // Hypothèse: redirection vers la page d'accueil

            // 3. Connexion
            $browser->visit('/login') // Hypothèse: route /login
                    ->type('#email', $user->email) // Hypothèse: input avec id="email"
                    ->type('#password', $password) // Hypothèse: input avec id="password"
                    ->press('Login') // Hypothèse: bouton avec le texte "Login"
                    ->assertPathIs('/home'); // Hypothèse: redirection vers /home après connexion

            // 4. Naviguer vers le menu et ajouter un article
            $browser->visit('/menu') // Hypothèse: route /menu
                    ->assertSee($menuItem->nom_article)
                    // Hypothèse: bouton "Ajouter au panier" avec une classe ou un attribut data-id
                    ->click('.add-to-cart-button[data-id="' . $menuItem->id_article . '"]')
                    ->assertSee('Article ajouté au panier'); // Hypothèse: message de confirmation

            // 5. Naviguer vers le panier/checkout et passer la commande
            $browser->visit('/cart') // Hypothèse: route /cart
                    ->assertSee($menuItem->nom_article)
                    ->press('Place Order') // Hypothèse: bouton avec le texte "Place Order"
                    ->assertPathIs('/order-confirmation') // Hypothèse: redirection vers /order-confirmation
                    ->assertSee('Commande passée avec succès'); // Hypothèse: message de confirmation
        });
    }
}
