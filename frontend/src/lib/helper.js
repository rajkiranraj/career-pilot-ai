// Helper function to convert entries to markdown
export function entriesToMarkdown(entries, type) {
  if (!entries?.length) return "";

  return (
    `## ${type}\n\n` +
    entries
      .map((entry) => {
        const dateRange = entry.current
          ? `${entry.startDate} - Present`
          : `${entry.startDate} - ${entry.endDate}`;
        
        let headerDetails = dateRange;
        if (entry.location) headerDetails += ` | 📍 ${entry.location}`;
        if (entry.link) headerDetails += ` | 🔗 [${entry.link}](${entry.link})`;

        return `### ${entry.title} @ ${entry.organization}\n${headerDetails}\n\n${entry.description}`;
      })
      .join("\n\n")
  );
}
