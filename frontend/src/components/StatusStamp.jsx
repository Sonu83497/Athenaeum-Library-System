const STAMP_CLASSES = {
  active: "stamp-active",
  overdue: "stamp-overdue",
  returned: "stamp-returned",
  unpaid: "stamp-unpaid",
  paid: "stamp-paid",
  waived: "stamp-returned",
};

export default function StatusStamp({ status }) {
  const cls = STAMP_CLASSES[status] || "stamp-returned";
  return <span className={cls}>{status}</span>;
}
