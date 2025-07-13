chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "organizeTabs") {
    organizeTabs();
  }
});

async function organizeTabs() {
  const { tabGroups } = await chrome.storage.sync.get("tabGroups");
  const tabs = await chrome.tabs.query({});

  for (const group of tabGroups || []) {
    const regex = new RegExp(group.pattern);
    const matchedTabs = tabs.filter(tab => regex.test(tab.url));
    if (matchedTabs.length === 0) continue;

    const tabIds = matchedTabs.map(tab => tab.id);
    const groupId = await chrome.tabs.group({ tabIds });
    await chrome.tabGroups.update(groupId, { title: group.name, color: "blue" });
  }
}
