document.addEventListener("DOMContentLoaded", () => {
  if (!location.pathname.includes("/admin/")) return;

  const input = document.getElementById("bulkProducts");
  const addButton = document.getElementById("bulkAddButton");
  const clearButton = document.getElementById("bulkClearButton");
  const message = document.getElementById("bulkMessage");

  if (!input || !addButton) return;

  const setMessage = (text, error = false) => {
    if (!message) return;
    message.textContent = text;
    message.classList.add("show");
    message.style.color = error ? "#b91c1c" : "";
  };

  addButton.addEventListener("click", async () => {
    const lines = input.value
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean);

    if (!lines.length) {
      setMessage("Paste at least one product first.", true);
      return;
    }

    const products = [];
    const invalid = [];

    for (const line of lines) {
      const parts = line.split("|").map(part => part.trim());
      const brand = parts[0] || "";
      const flavor = parts.slice(1).join(" | ").trim();

      if (!brand || !flavor) {
        invalid.push(line);
        continue;
      }

      products.push({
        brand,
        flavor,
        name: `${flavor} ${brand}`,
        category: "Drinks",
        price: 3,
        bundle_label: "2 for $5",
        stock: 0,
        active: true
      });
    }

    if (invalid.length) {
      setMessage(`Skipped ${invalid.length} line${invalid.length === 1 ? "" : "s"} without the format Brand | Flavor.`, true);
      return;
    }

    addButton.disabled = true;
    addButton.textContent = "Adding...";

    try {
      const { data: existing, error: existingError } = await sb
        .from("products")
        .select("brand,flavor");

      if (existingError) throw existingError;

      const existingKeys = new Set(
        (existing || []).map(p => `${(p.brand || "").trim().toLowerCase()}|${(p.flavor || "").trim().toLowerCase()}`)
      );

      const unique = [];
      const seen = new Set();

      for (const product of products) {
        const key = `${product.brand.toLowerCase()}|${product.flavor.toLowerCase()}`;
        if (existingKeys.has(key) || seen.has(key)) continue;
        seen.add(key);
        unique.push(product);
      }

      if (!unique.length) {
        setMessage("All of those products already exist.");
        return;
      }

      const { error } = await sb.from("products").insert(unique);
      if (error) throw error;

      setMessage(`Added ${unique.length} product${unique.length === 1 ? "" : "s"}. Each is $3 with 2 for $5, starting at 0 stock.`);
      input.value = "";

      setTimeout(() => location.reload(), 700);
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Could not add the products.", true);
    } finally {
      addButton.disabled = false;
      addButton.textContent = "Add Products";
    }
  });

  clearButton?.addEventListener("click", () => {
    input.value = "";
    setMessage("");
  });
});
