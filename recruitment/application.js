const birth = document.querySelector("#birth");
const age = document.querySelector("#age");
const photo = document.querySelector("#photo");
const appliedOn = document.querySelector("#applied-on");
const today = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

birth.max = today;
appliedOn.max = today;
appliedOn.value = today;

birth.addEventListener("input", () => {
  if (!birth.value || birth.value > today) {
    age.value = "";
    return;
  }
  const years = Number(today.slice(0, 4)) - Number(birth.value.slice(0, 4));
  age.value = years - Number(today.slice(5) < birth.value.slice(5));
});

photo.addEventListener("change", () => {
  const file = photo.files[0];
  if (!file) {
    photo.setCustomValidity("");
    return;
  }
  const allowedTypes = ["image/jpeg", "image/png"];
  if (!allowedTypes.includes(file.type)) {
    photo.setCustomValidity("JPG 또는 PNG 사진을 선택해 주세요.");
  } else if (file.size > 5 * 1024 * 1024) {
    photo.setCustomValidity("사진은 5MB 이하로 첨부해 주세요.");
  } else {
    photo.setCustomValidity("");
  }
  photo.reportValidity();
});
