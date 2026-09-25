/** Guest list — table name and the people seated there, in listed order. */
export const TABLE_DATA = [
  { table: "Mongu", guests: [
    "Karen", "Alan", "Abbie", "Arabella", "Nathan", "Leigh", "Nathan", "Catherine", "Judith", "Felix",
  ]},
  { table: "Lusaka", guests: [
    "Joanne", "Nicholas", "Tom", "Rose", "Sage", "Arlo", "Luke", "Alice", "Dom", "Elise",
  ]},
  { table: "Luanshya", guests: [
    "Muchona", "Stanley", "Mulumba", "Nelly", "Dave", "Ilham", "Jamilatu", "Janette", "Josephine", "Princess", "Kenaya",
  ]},
  { table: "Ndola", guests: [
    "Kunda", "Kirsty", "Josiah", "Publa", "David", "Eastwood", "Ethan", "Mercy", "Star", "Enoch", "Kapambwe",
  ]},
  { table: "Kamwala South", guests: [
    "Amanda", "Arlyne", "Barbara", "Naana", "Anita", "Sam", "Elena", "Mellody", "Tom", "Hazel", "Nathan",
  ]},
  { table: "Serenje", guests: [
    "Kerrie", "Chris", "Ellie", "Jack", "Evie", "Ruth", "Paul", "Ben", "Taru", "Pippa", "Elsie",
  ]},
  { table: "Lukulu", guests: [
    "Martin", "Amy", "Luke", "Chloe", "Welsh", "Clare", "JD", "Cat", "Vicki", "Daniel", "Ryan",
  ]},
  { table: "Chinsali", guests: [
    "Olivia", "Asher", "Phil", "Julie", "Brooklyn", "Josh", "Chief", "Lewis", "Micah-Joy", "Tasha", "Judy", "James",
  ]},
  { table: "Chifubu", guests: [
    "Sophie", "Christiana", "Victoria", "Steph", "Jamia", "Moses", "Jenny", "Drea", "Trish", "Obed", "Fred", "Silvana",
  ]},
];

export function buildGuestRows() {
  const rows = [];
  TABLE_DATA.forEach(({ table, section, guests }, index) => {
    const tableName = String(table).trim();
    for (const name of guests) {
      const trimmed = name.trim();
      if (!trimmed) continue;
      rows.push({
        name: trimmed,
        table_number: tableName,
        table: tableName,
        section: section || "",
        table_order: index,
      });
    }
  });
  return rows;
}
