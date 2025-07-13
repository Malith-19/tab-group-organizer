document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("group-form");
  const groupList = document.getElementById("group-list");
  const organizeBtn = document.getElementById("organize-btn");

  function renderGroups(groups) {
    groupList.innerHTML = "";
    groups.forEach((group, index) => {
      const li = document.createElement("li");
      li.style.display = "flex";
      li.style.alignItems = "center";

      const textSpan = document.createElement("span");
      textSpan.textContent = `${group.name}: ${group.pattern}`;
      textSpan.style.display = "inline-block";
      textSpan.style.width = "800px"; // Fixed width instead of flex
      textSpan.style.overflow = "hidden";
      textSpan.style.whiteSpace = "nowrap";
      textSpan.style.textOverflow = "ellipsis";

      const delBtn = document.createElement("button");
      delBtn.textContent = "x";
      delBtn.style.marginLeft = "auto";

      delBtn.onclick = () => {
        groups.splice(index, 1);
        chrome.storage.sync.set({ tabGroups: groups }, () =>
          renderGroups(groups)
        );
      };

      li.appendChild(textSpan);
      li.appendChild(delBtn);
      groupList.appendChild(li);
    });
  }

  function globToRegex(glob) {
    return (
      "^" +
      glob.replace(/\./g, "\\.").replace(/\*/g, ".*").replace(/\//g, "\\/") +
      "$"
    );
  }

  chrome.storage.sync.get(["tabGroups"], (result) => {
    renderGroups(result.tabGroups || []);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("group-name").value.trim();
    let pattern = document.getElementById("url-pattern").value.trim();
    pattern = globToRegex(pattern); // Convert glob to regex.
    if (!name || !pattern) return;
    chrome.storage.sync.get(["tabGroups"], (result) => {
      const groups = result.tabGroups || [];
      groups.push({ name, pattern });
      chrome.storage.sync.set({ tabGroups: groups }, () => {
        renderGroups(groups);
        form.reset();
      });
    });
  });

  organizeBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "organizeTabs" });
  });
});
