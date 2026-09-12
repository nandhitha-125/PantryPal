import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import "./RecipeIdeas.css";

export default function RecipeIdeas({
  onTabChange,
  onAddItem,
  groceries = [],
  loadingGroceries = false,
  groceriesError = null,
  onRetryPantry,
}) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customInput, setCustomInput] = useState(null);

  // Safe memoized groceries array
  const safeGroceries = useMemo(() => {
    return Array.isArray(groceries) ? groceries : [];
  }, [groceries]);

  // Extract unique grocery names from the actual inventory
  const uniquePantryIngredients = useMemo(() => {
    const seen = new Set();
    const list = [];
    for (const item of safeGroceries) {
      const name = item?.name?.trim();
      if (name && !seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        list.push(name);
      }
    }
    return list;
  }, [safeGroceries]);

  // Build the comma-separated ingredient string from the actual inventory
  const pantryIngredientsString = useMemo(() => {
    return uniquePantryIngredients.join(", ");
  }, [uniquePantryIngredients]);

  // If user hasn't typed a custom query, use the live pantry ingredients string
  const ingredientsInput = customInput !== null ? customInput : pantryIngredientsString;

  const lastPantryQueryRef = useRef(null);

  // Fetch recipe ideas for user interactions (submit, chips, retry)
  const fetchRecipes = useCallback(async (ingredientsString) => {
    const query = ingredientsString.trim();
    if (!query) {
      setError("Please enter at least one ingredient to search for recipes.");
      setRecipes([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:5000/api/recipes?ingredients=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to fetch recipes (${response.status} ${response.statusText})`
        );
      }

      const data = await response.json();
      setRecipes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load recipe suggestions. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Automatically fetch recipes for live pantry inventory on initial load or when pantry updates
  useEffect(() => {
    if (loadingGroceries || !pantryIngredientsString) {
      return;
    }

    // Only auto-fetch when pantry ingredients string is newly available or has changed
    if (lastPantryQueryRef.current !== pantryIngredientsString) {
      lastPantryQueryRef.current = pantryIngredientsString;

      let isMounted = true;
      const controller = new AbortController();

      fetch(
        `http://localhost:5000/api/recipes?ingredients=${encodeURIComponent(pantryIngredientsString)}`,
        { signal: controller.signal }
      )
        .then((res) => {
          if (!res.ok) {
            return res.json().catch(() => ({})).then((data) => {
              throw new Error(data.message || `Failed to fetch recipes (${res.status})`);
            });
          }
          return res.json();
        })
        .then((data) => {
          if (isMounted) {
            setRecipes(Array.isArray(data) ? data : []);
            setLoading(false);
          }
        })
        .catch((err) => {
          if (isMounted && err.name !== "AbortError") {
            setError(err.message || "Failed to load recipe suggestions.");
            setLoading(false);
          }
        });

      return () => {
        isMounted = false;
        controller.abort();
      };
    }
  }, [loadingGroceries, pantryIngredientsString]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchRecipes(ingredientsInput);
  };

  const handlePantryChipClick = (item) => {
    const currentList = ingredientsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    let updated;
    if (currentList.some((i) => i.toLowerCase() === item.toLowerCase())) {
      updated = currentList.filter((i) => i.toLowerCase() !== item.toLowerCase());
    } else {
      updated = [...currentList, item];
    }

    const newQuery = updated.join(", ");
    setCustomInput(newQuery);
    if (newQuery) {
      fetchRecipes(newQuery);
    } else {
      setRecipes([]);
    }
  };

  const handleResetToPantry = () => {
    setCustomInput(null);
    if (pantryIngredientsString) {
      fetchRecipes(pantryIngredientsString);
    } else {
      setRecipes([]);
    }
  };

  return (
    <div className="recipes-container">
      {/* Header Section */}
      <section className="recipes-header" aria-labelledby="recipes-heading">
        <div className="recipes-title-row">
          <h1 id="recipes-heading" className="recipes-title">
            Recipe Ideas 🍳
          </h1>
          {onTabChange && (
            <button
              type="button"
              className="back-to-inventory-btn"
              onClick={() => onTabChange("inventory")}
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Back to Inventory</span>
            </button>
          )}
        </div>
        <p className="recipes-subtitle">
          Discover delicious recipes you can cook right now with your pantry ingredients
        </p>
      </section>

      {/* Ingredient Search & Filter Card */}
      <section className="ingredients-control-card" aria-label="Ingredients search">
        <form onSubmit={handleSubmit} className="ingredients-form">
          <label htmlFor="ingredients-input" className="ingredients-label">
            Ingredients to Cook With:
          </label>
          <div className="ingredients-input-row">
            <input
              id="ingredients-input"
              type="text"
              className="ingredients-input"
              value={ingredientsInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="e.g. Chicken, Rice, Tomatoes..."
            />
            <button
              type="submit"
              className="find-recipes-btn"
              disabled={loading || !ingredientsInput.trim()}
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>{loading ? "Searching..." : "Find Recipes"}</span>
            </button>
          </div>

          {/* Quick Pantry Ingredients Tags */}
          {!loadingGroceries && uniquePantryIngredients.length > 0 && (
            <div className="pantry-tags-wrapper">
              <span className="pantry-tags-label">From your pantry:</span>
              <div className="pantry-chips-list">
                {uniquePantryIngredients.slice(0, 12).map((item, idx) => {
                  const currentList = ingredientsInput
                    .split(",")
                    .map((s) => s.trim().toLowerCase());
                  const isSelected = currentList.includes(item.toLowerCase());
                  return (
                    <button
                      key={`${item}-${idx}`}
                      type="button"
                      className={`pantry-chip ${isSelected ? "selected" : ""}`}
                      onClick={() => handlePantryChipClick(item)}
                      title={`Click to ${isSelected ? "remove" : "add"} ${item}`}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </form>
      </section>

      {/* Pantry Inventory Loading State */}
      {loadingGroceries && (
        <div className="recipes-status-box recipes-loading-box">
          <div className="status-spinner" aria-hidden="true"></div>
          <p>Loading your pantry ingredients...</p>
        </div>
      )}

      {/* Pantry Inventory Error State */}
      {!loadingGroceries && groceriesError && (
        <div className="recipes-status-box recipes-error-box" role="alert">
          <span className="error-icon" aria-hidden="true">
            ⚠️
          </span>
          <div className="error-content">
            <p className="error-title">Could not load pantry inventory</p>
            <p className="error-desc">{groceriesError}</p>
          </div>
          {onRetryPantry && (
            <button type="button" className="retry-btn" onClick={onRetryPantry}>
              Retry
            </button>
          )}
        </div>
      )}

      {/* Empty Pantry State - Shown when pantry has no items */}
      {!loadingGroceries && !groceriesError && safeGroceries.length === 0 && (
        <div className="recipes-status-box recipes-empty-box" role="status">
          <div className="recipes-empty-icon" aria-hidden="true">
            🧺
          </div>
          <p className="recipes-empty-title">Your Pantry is Empty</p>
          <p className="recipes-empty-desc">
            Add ingredients to your pantry inventory first! PantryPal will automatically find delicious recipes you can cook with them.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center", marginTop: "0.5rem" }}>
            {onAddItem && (
              <button
                type="button"
                className="find-recipes-btn"
                onClick={onAddItem}
              >
                <span>+ Add Item to Pantry</span>
              </button>
            )}
            {onTabChange && (
              <button
                type="button"
                className="back-to-inventory-btn"
                onClick={() => onTabChange("inventory")}
              >
                <span>Go to Inventory</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Recipe Searching Loading State */}
      {loading && (
        <div className="recipes-status-box recipes-loading-box">
          <div className="status-spinner" aria-hidden="true"></div>
          <p>Finding the best recipes matching your ingredients...</p>
        </div>
      )}

      {/* Recipe Fetch Error State */}
      {!loading && error && (
        <div className="recipes-status-box recipes-error-box" role="alert">
          <span className="error-icon" aria-hidden="true">
            ⚠️
          </span>
          <div className="error-content">
            <p className="error-title">Could not load recipes</p>
            <p className="error-desc">{error}</p>
          </div>
          <button
            type="button"
            className="retry-btn"
            onClick={() => fetchRecipes(ingredientsInput)}
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty Recipe Search Results */}
      {!loadingGroceries &&
        !loading &&
        !error &&
        safeGroceries.length > 0 &&
        recipes.length === 0 &&
        ingredientsInput.trim() !== "" && (
          <div className="recipes-status-box recipes-empty-box" role="status">
            <div className="recipes-empty-icon" aria-hidden="true">
              🍽️
            </div>
            <p className="recipes-empty-title">No matching recipes found</p>
            <p className="recipes-empty-desc">
              We couldn&apos;t find any recipes for &ldquo;{ingredientsInput}&rdquo;. Try adjusting your ingredients or adding common staples like olive oil, garlic, or pasta.
            </p>
            {pantryIngredientsString && (
              <button
                type="button"
                className="find-recipes-btn"
                onClick={handleResetToPantry}
              >
                Reset to All Pantry Ingredients
              </button>
            )}
          </div>
        )}

      {/* Recipe Cards Grid */}
      {!loading && !error && recipes.length > 0 && (
        <div className="recipes-grid">
          {recipes.map((recipe) => (
            <article key={recipe.id} className="recipe-card">
              <div className="recipe-image-container">
                <img
                  src={recipe.image || "https://placehold.co/312x231?text=No+Image"}
                  alt={recipe.title}
                  className="recipe-image"
                  loading="lazy"
                />
              </div>
              <div className="recipe-card-content">
                <h2 className="recipe-title">{recipe.title}</h2>

                <div className="recipe-badges">
                  <span className="recipe-badge badge-used">
                    ✓ {recipe.usedIngredientCount || 0} In Pantry
                  </span>
                  {recipe.missedIngredientCount > 0 && (
                    <span className="recipe-badge badge-missed">
                      + {recipe.missedIngredientCount} Needed
                    </span>
                  )}
                </div>

                {/* Used & Missed Ingredients Preview */}
                <div className="recipe-ingredients-preview">
                  <div className="ingredients-list-title">Ingredients:</div>
                  <div className="ingredients-pill-list">
                    {recipe.usedIngredients?.map((ing, i) => (
                      <span key={`used-${recipe.id}-${i}`} className="ingredient-pill">
                        {ing.name}
                      </span>
                    ))}
                    {recipe.missedIngredients?.slice(0, 3).map((ing, i) => (
                      <span
                        key={`missed-${recipe.id}-${i}`}
                        className="ingredient-pill missed"
                      >
                        {ing.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
