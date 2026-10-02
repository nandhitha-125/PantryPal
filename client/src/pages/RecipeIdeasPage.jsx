import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { usePantry } from "../context/usePantry";
import { useAuth } from "../context/useAuth";
import { getExpiryStatus } from "../utils/expiryUtils";
import "./RecipeIdeasPage.css";

export default function RecipeIdeasPage() {
  const { groceries, loadingGroceries } = usePantry();
  const { token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [recipes, setRecipes] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [recipeError, setRecipeError] = useState(null);
  const [customQuery, setCustomQuery] = useState("");
  const [userSelectedIngredients, setUserSelectedIngredients] = useState(null);
  const [addedShoppingStatus, setAddedShoppingStatus] = useState({});

  // Extract unique ingredient names from real pantry inventory
  const pantryIngredients = useMemo(() => {
    const seen = new Set();
    const list = [];
    groceries.forEach((item) => {
      const name = item.name?.trim();
      if (name && !seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        list.push(name);
      }
    });
    return list;
  }, [groceries]);

  // Check if all groceries are expired (none are fresh/usable)
  const allGroceriesExpired = useMemo(() => {
    if (!Array.isArray(groceries) || groceries.length === 0) return false;
    return groceries.every((item) => {
      const status = getExpiryStatus(item.expiryDate);
      return status.label === "Expired";
    });
  }, [groceries]);

  const incomingIngredient = location.state?.searchIngredient || "";

  // Effective selected ingredients (derived unless user has modified them)
  const selectedIngredients = useMemo(() => {
    if (userSelectedIngredients !== null) {
      return userSelectedIngredients;
    }
    if (incomingIngredient) {
      return [incomingIngredient];
    }
    return pantryIngredients.slice(0, 6);
  }, [userSelectedIngredients, incomingIngredient, pantryIngredients]);

  // Fetch recipes function for user actions (form submit, chip toggle)
  const fetchRecipes = useCallback(async (queryStr) => {
    const query = (queryStr || "").trim();
    if (!query) {
      setRecipeError("Please select or enter at least one ingredient.");
      setRecipes([]);
      return;
    }

    setLoadingRecipes(true);
    setRecipeError(null);

    try {
      const res = await fetch(
        `http://localhost:5000/api/recipes?ingredients=${encodeURIComponent(query)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Recipe service returned ${res.status}`);
      }

      const data = await res.json();
      setRecipes(Array.isArray(data) ? data : []);
    } catch (err) {
      setRecipeError(
        err.message || "Failed to fetch recipes. Please check your backend connection."
      );
    } finally {
      setLoadingRecipes(false);
    }
  }, [token]);

  // Initial automatic load when groceries are available
  const initialLoadDone = useRef(false);

  useEffect(() => {
    if (initialLoadDone.current || loadingGroceries) return;

    const initialQuery = incomingIngredient || (pantryIngredients.length > 0 ? pantryIngredients.slice(0, 6).join(", ") : "");
    if (!initialQuery) return;

    initialLoadDone.current = true;
    let isMounted = true;

    fetch(`http://localhost:5000/api/recipes?ingredients=${encodeURIComponent(initialQuery)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Recipe service returned ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setRecipes(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setRecipeError(err.message || "Failed to fetch recipes. Please verify backend is running.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [loadingGroceries, incomingIngredient, pantryIngredients, token]);

  const handleChipToggle = (ingredient) => {
    let updated;
    if (selectedIngredients.some((i) => i.toLowerCase() === ingredient.toLowerCase())) {
      updated = selectedIngredients.filter(
        (i) => i.toLowerCase() !== ingredient.toLowerCase()
      );
    } else {
      updated = [...selectedIngredients, ingredient];
    }

    setUserSelectedIngredients(updated);
    const newQuery = updated.join(", ");
    setCustomQuery(newQuery);

    if (updated.length > 0) {
      fetchRecipes(newQuery);
    } else {
      setRecipes([]);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const query = customQuery || selectedIngredients.join(", ");
    fetchRecipes(query);
  };

  // Add missing ingredients from recipe to the Shopping List
  const handleAddMissingToShopping = async (recipe) => {
    if (!recipe.missedIngredients || recipe.missedIngredients.length === 0) return;

    setAddedShoppingStatus((prev) => ({ ...prev, [recipe.id]: "adding" }));

    try {
      for (const ing of recipe.missedIngredients) {
        await fetch("http://localhost:5000/api/shopping", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: ing.name,
            quantity: 1,
            completed: false,
          }),
        });
      }

      setAddedShoppingStatus((prev) => ({ ...prev, [recipe.id]: "success" }));
      setTimeout(() => {
        setAddedShoppingStatus((prev) => ({ ...prev, [recipe.id]: null }));
      }, 3000);
    } catch {
      setAddedShoppingStatus((prev) => ({ ...prev, [recipe.id]: "error" }));
    }
  };

  const displayQuery = customQuery || selectedIngredients.join(", ");

  return (
    <div className="recipes-page animate-fade-in">
      {/* Header */}
      <div className="recipes-header">
        <div className="recipes-title-group">
          <h1 className="recipes-title display-title">Recipe Ideas</h1>
          <p className="recipes-subtitle">
            Instantly discover meals matching the real groceries in your pantry
          </p>
        </div>
      </div>

      {/* All Groceries Expired State */}
      {!loadingGroceries && allGroceriesExpired && (
        <div className="no-groceries-state">
          <div className="empty-icon-box">🚫</div>
          <h2 className="empty-title">No Fresh Groceries Available</h2>
          <p className="empty-subtitle">
            All items in your pantry have expired. Please add fresh groceries to your inventory to discover recipe ideas.
          </p>
          <button
            type="button"
            className="btn-go-inventory"
            onClick={() => navigate("/app/inventory")}
          >
            Go to Inventory →
          </button>
        </div>
      )}

      {/* Normal flow only when not all groceries are expired */}
      {!allGroceriesExpired && (
      <>
      {/* Ingredient Selector Card */}
      <div className="ingredients-selector-panel">
        <form onSubmit={handleFormSubmit} className="search-form">
          <label htmlFor="recipe-search-input" className="selector-label">
            Active Ingredients to Match:
          </label>
          <div className="search-input-wrapper">
            <input
              id="recipe-search-input"
              type="text"
              className="recipe-search-field"
              placeholder="e.g. tomatoes, chicken, garlic..."
              value={displayQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
            />
            <button
              type="submit"
              className="btn-find-recipes"
              disabled={loadingRecipes}
            >
              {loadingRecipes ? (
                <>
                  <span className="btn-spinner"></span>
                  <span>Searching...</span>
                </>
              ) : (
                "Search Recipes"
              )}
            </button>
          </div>
        </form>

        {/* Pantry Stock Chips */}
        <div className="chips-section">
          <span className="chips-title">Toggle Pantry Ingredients:</span>
          {pantryIngredients.length === 0 ? (
            <p className="chips-empty">
              No items in pantry yet.{" "}
              <button
                type="button"
                className="link-btn"
                onClick={() => navigate("/app/inventory")}
              >
                Add groceries to your inventory
              </button>{" "}
              to enable automated recipe matching.
            </p>
          ) : (
            <div className="chips-container">
              {pantryIngredients.map((item) => {
                const isSelected = selectedIngredients.some(
                  (i) => i.toLowerCase() === item.toLowerCase()
                );
                return (
                  <button
                    key={item}
                    type="button"
                    className={`ingredient-chip ${isSelected ? "selected" : ""}`}
                    onClick={() => handleChipToggle(item)}
                    aria-pressed={isSelected}
                  >
                    <span className="chip-check">{isSelected ? "✓" : "+"}</span>
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Error State */}
      {recipeError && (
        <div className="recipe-alert-banner" role="alert">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{recipeError}</span>
        </div>
      )}

      {/* Loading Skeleton Grid */}
      {loadingRecipes && (
        <div className="recipes-grid">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="recipe-card skeleton-card">
              <div className="skeleton-image"></div>
              <div className="skeleton-content">
                <div className="skeleton-line full"></div>
                <div className="skeleton-line half"></div>
                <div className="skeleton-line third"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State: No results found */}
      {!loadingRecipes && !recipeError && recipes.length === 0 && (
        <div className="recipes-empty-state">
          <div className="empty-icon-box">🍳</div>
          <h2 className="empty-title">No Recipes Found</h2>
          <p className="empty-subtitle">
            Try selecting different ingredient combinations or enter common pantry staples like garlic, onion, or pasta.
          </p>
        </div>
      )}

      {/* Results Recipe Cards Grid */}
      {!loadingRecipes && recipes.length > 0 && (
        <div className="recipes-results-section">
          <div className="results-count-bar">
            <span>Found <strong>{recipes.length}</strong> chef-curated recipes matching your ingredients</span>
          </div>

          <div className="recipes-grid">
            {recipes.map((recipe) => {
              const status = addedShoppingStatus[recipe.id];
              return (
                <div key={recipe.id} className="recipe-card">
                  {/* Recipe Image with Hover Zoom */}
                  <div className="recipe-img-box">
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      loading="lazy"
                      className="recipe-img"
                    />
                    <div className="recipe-badge-overlay">
                      <span className="badge-used">
                        ✓ {recipe.usedIngredientCount || 0} In Pantry
                      </span>
                      {recipe.missedIngredientCount > 0 && (
                        <span className="badge-missing">
                          + {recipe.missedIngredientCount} Needed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="recipe-card-body">
                    <h3 className="recipe-card-title" title={recipe.title}>
                      {recipe.title}
                    </h3>

                    {/* Ingredients Breakdown */}
                    <div className="ingredients-breakdown">
                      {recipe.usedIngredients && recipe.usedIngredients.length > 0 && (
                        <div className="ing-group">
                          <span className="ing-group-label in-stock">
                            ✓ From your pantry:
                          </span>
                          <p className="ing-names">
                            {recipe.usedIngredients.map((ing) => ing.name).join(", ")}
                          </p>
                        </div>
                      )}

                      {recipe.missedIngredients && recipe.missedIngredients.length > 0 && (
                        <div className="ing-group">
                          <span className="ing-group-label missing">
                            • Missing ingredients:
                          </span>
                          <p className="ing-names text-muted">
                            {recipe.missedIngredients.map((ing) => ing.name).join(", ")}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="recipe-card-actions">
                      {recipe.missedIngredients && recipe.missedIngredients.length > 0 ? (
                        <button
                          type="button"
                          className={`btn-add-missing ${status || ""}`}
                          onClick={() => handleAddMissingToShopping(recipe)}
                          disabled={status === "adding" || status === "success"}
                        >
                          {status === "adding" && "Adding items..."}
                          {status === "success" && "✓ Added to Shopping List"}
                          {status === "error" && "Error adding items"}
                          {!status && "+ Add Missing to Shopping List"}
                        </button>
                      ) : (
                        <span className="all-in-stock-tag">
                          ✓ All ingredients in stock!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
}
