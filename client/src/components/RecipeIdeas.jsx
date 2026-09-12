import { useState, useEffect, useCallback } from "react";
import "./RecipeIdeas.css";

export default function RecipeIdeas({ onTabChange }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ingredientsInput, setIngredientsInput] = useState("milk, egg, bread");
  const [pantryItems, setPantryItems] = useState([]);
  const [loadingPantry, setLoadingPantry] = useState(true);

  // Fetch recipe ideas from Spoonacular backend endpoint
  const fetchRecipes = useCallback(async (ingredientsString) => {
    const query = ingredientsString.trim();
    if (!query) {
      setError("Please enter at least one ingredient to search for recipes.");
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

  // Fetch pantry groceries on mount to provide quick ingredient chips
  useEffect(() => {
    let isMounted = true;

    fetch("http://localhost:5000/api/groceries")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!isMounted) return;
        setLoadingPantry(false);
        if (Array.isArray(data) && data.length > 0) {
          const names = data.map((item) => item.name.trim()).filter(Boolean);
          setPantryItems(names);

          // If ingredientsInput has default, use up to 4 pantry items
          const topIngredients = names.slice(0, 4).join(", ");
          if (topIngredients) {
            setIngredientsInput(topIngredients);
            fetchRecipes(topIngredients);
            return;
          }
        }
        // Fallback default
        fetchRecipes("milk, egg, bread");
      })
      .catch(() => {
        if (!isMounted) return;
        setLoadingPantry(false);
        fetchRecipes("milk, egg, bread");
      });

    return () => {
      isMounted = false;
    };
  }, [fetchRecipes]);

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
    setIngredientsInput(newQuery);
    if (newQuery) {
      fetchRecipes(newQuery);
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
              onChange={(e) => setIngredientsInput(e.target.value)}
              placeholder="e.g. milk, eggs, bread, cheese..."
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
          {!loadingPantry && pantryItems.length > 0 && (
            <div className="pantry-tags-wrapper">
              <span className="pantry-tags-label">From your pantry:</span>
              <div className="pantry-chips-list">
                {pantryItems.slice(0, 8).map((item, idx) => {
                  const isSelected = ingredientsInput
                    .toLowerCase()
                    .includes(item.toLowerCase());
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

      {/* Loading State */}
      {loading && (
        <div className="recipes-status-box recipes-loading-box">
          <div className="status-spinner" aria-hidden="true"></div>
          <p>Finding the best recipes matching your ingredients...</p>
        </div>
      )}

      {/* Error State */}
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

      {/* Empty State */}
      {!loading && !error && recipes.length === 0 && (
        <div className="recipes-status-box recipes-empty-box" role="status">
          <div className="recipes-empty-icon" aria-hidden="true">
            🍽️
          </div>
          <p className="recipes-empty-title">No matching recipes found</p>
          <p className="recipes-empty-desc">
            We couldn&apos;t find any recipes for &ldquo;{ingredientsInput}&rdquo;. Try adding common
            staples like chicken, milk, eggs, pasta, or flour.
          </p>
          <button
            type="button"
            className="find-recipes-btn"
            onClick={() => {
              setIngredientsInput("milk, egg, bread");
              fetchRecipes("milk, egg, bread");
            }}
          >
            Reset to Sample Ingredients
          </button>
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
