export async function loadComponent(url, targetElement) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load component: ${response.statusText}`);
        }
        const text = await response.text();
        targetElement.innerHTML = text; // Changed from += to =
    } catch (error) {
        console.error(`Error loading component from ${url}:`, error);
    }
}
