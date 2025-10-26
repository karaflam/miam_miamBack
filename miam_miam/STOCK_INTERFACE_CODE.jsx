        {activeTab === "stock" && (
          <div className="mt-4 lg:mt-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Gestion du Stock</h2>
            </div>

            {isLoadingStock ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Chargement du stock...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Statistiques du stock */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Articles</p>
                        <p className="text-2xl font-bold">{stockItems.length}</p>
                      </div>
                      <Package className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">En Rupture</p>
                        <p className="text-2xl font-bold text-red-600">
                          {stockItems.filter(item => item.stock?.en_rupture).length}
                        </p>
                      </div>
                      <Ban className="w-8 h-8 text-red-500" />
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Alerte Stock</p>
                        <p className="text-2xl font-bold text-yellow-600">
                          {stockItems.filter(item => item.stock?.alerte_stock).length}
                        </p>
                      </div>
                      <Bell className="w-8 h-8 text-yellow-500" />
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Disponibles</p>
                        <p className="text-2xl font-bold text-green-600">
                          {stockItems.filter(item => item.disponible && !item.stock?.en_rupture).length}
                        </p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                </div>

                {/* Tableau du stock */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Article</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Catégorie</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Quantité</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Seuil d'alerte</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Statut</th>
                          <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {stockItems.map((item) => (
                          <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                                  {item.image && (
                                    <img src={item.image} alt={item.nom} className="w-full h-full object-cover" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-semibold">{item.nom}</p>
                                  <p className="text-sm text-gray-500">{item.prix} FCFA</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {item.categorie?.nom || 'Sans catégorie'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`text-lg font-bold ${
                                item.stock?.en_rupture ? 'text-red-600' :
                                item.stock?.alerte_stock ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {item.stock?.quantite_disponible ?? 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-gray-600">
                                {item.stock?.seuil_alerte ?? 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {item.stock?.en_rupture ? (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Rupture
                                </span>
                              ) : item.stock?.alerte_stock ? (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Alerte
                                </span>
                              ) : (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  OK
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => openEditStockModal(item)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                  title="Modifier le stock"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    const quantite = prompt('Quantité à ajouter (nombre positif) ou retirer (nombre négatif):');
                                    if (quantite !== null && quantite !== '') {
                                      const ajustement = parseInt(quantite);
                                      if (!isNaN(ajustement)) {
                                        const raison = prompt('Raison de l\'ajustement (optionnel):');
                                        handleAdjustStock(item.id, ajustement, raison || '');
                                      }
                                    }
                                  }}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                  title="Ajuster le stock"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {stockItems.length === 0 && (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Aucun article trouvé</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal de modification du stock */}
        {showStockModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-6">
                  Modifier le stock - {editingStock?.nom}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Quantité disponible</label>
                    <input
                      type="number"
                      min="0"
                      value={stockFormData.quantite_disponible}
                      onChange={(e) => setStockFormData({...stockFormData, quantite_disponible: e.target.value})}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="Ex: 50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Seuil d'alerte</label>
                    <input
                      type="number"
                      min="0"
                      value={stockFormData.seuil_alerte}
                      onChange={(e) => setStockFormData({...stockFormData, seuil_alerte: e.target.value})}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="Ex: 10"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Une alerte sera déclenchée quand la quantité atteint ce seuil
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowStockModal(false);
                      resetStockForm();
                    }}
                    className="flex-1 px-6 py-3 border border-border rounded-lg font-semibold hover:bg-muted transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleUpdateStock}
                    className="flex-1 bg-primary text-secondary px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
