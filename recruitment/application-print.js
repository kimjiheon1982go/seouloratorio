const application = document.querySelector("#application-form");
const printArea = document.querySelector("#application-print");
const template = printArea.querySelector(".application-template");
const values = document.querySelector("#application-values");
const appendix = document.querySelector("#application-appendix");
const overflow = document.querySelector("#application-overflow");
const pdfButton = document.querySelector("#save-pdf");
const pdfStatus = document.querySelector("#pdf-status");

function place(element, left, top, width, height) {
  element.style.left = `${left / 724 * 100}%`;
  element.style.top = `${top / 1024 * 100}%`;
  element.style.width = `${width / 724 * 100}%`;
  element.style.height = `${height / 1024 * 100}%`;
  values.append(element);
}

pdfButton.addEventListener("click", async () => {
  pdfButton.disabled = true;
  pdfStatus.textContent = "";
  const data = new FormData(application);
  const value = (name) => String(data.get(name) ?? "").trim();
  const photoInput = document.querySelector("#photo");
  const file = photoInput.files[0];
  let photoUrl;

  values.replaceChildren();
  overflow.replaceChildren();
  printArea.classList.add("preparing");
  const addOverflow = (name, text) => {
    const label = document.createElement("dt");
    const content = document.createElement("dd");
    label.textContent = name;
    content.textContent = text;
    overflow.append(label, content);
  };
  const addValue = (name, box, {text = value(name), cover = false, append = true} = {}) => {
    if (!text) return;
    const field = document.createElement("span");
    field.className = "application-value";
    field.textContent = text;
    if (cover) field.style.backgroundColor = "white";
    place(field, ...box);
    if (append && field.scrollHeight > field.clientHeight) {
      field.textContent = "별지 참조";
      addOverflow(name, text);
    }
  };

  try {
    if (file && !photoInput.reportValidity()) return;
    await template.decode();
    await document.fonts.ready;
    addValue("성명", [260, 169, 291, 22]);
    addValue("한자 성명", [260, 198, 291, 22]);
    addValue("영문 성명", [260, 228, 291, 22]);
    addValue("만 나이", [242, 258, 36, 21]);
    addValue("생년월일", [183, 285, 367, 21]);
    addValue("우편번호", [182, 310, 92, 22], {cover: true});
    addValue("주소", [182, 334, 482, 24]);
    addValue("전화번호", [181, 366, 112, 24]);
    addValue("휴대폰", [383, 366, 96, 24]);
    addValue("이메일", [543, 366, 127, 24]);

    const education = value("학력 사항").split(/\r?\n/).filter(line => line.trim());
    education.slice(0, 4).forEach((line, index) => {
      addValue("학력 사항", [97, 395 + index * 25, 573, 20], {text: line, cover: true});
    });
    if (education.length > 4) addOverflow("학력 사항 계속", education.slice(4).join("\n"));
    addValue("현재 근무처", [141, 494, 526, 19], {cover: true});
    addValue("입단 경로", [141, 538, 526, 19]);
    const experience = value("연주 경력과 현재 활동");
    if (experience) {
      const lines = experience.split(/\r?\n/);
      lines.slice(0, 5).forEach((line, index) => {
        addValue("연주 경력과 현재 활동", [142, 567 + index * 36, 525, 26], {text: line});
      });
      if (lines.length > 5) addOverflow("연주 경력과 현재 활동 계속", lines.slice(5).join("\n"));
    }

    const [year, month, day] = value("지원일").split("-");
    addValue("지원일", [401, 886, 40, 21], {text: year});
    addValue("지원일", [486, 886, 28, 21], {text: month ?? ""});
    addValue("지원일", [550, 886, 28, 21], {text: day ?? ""});
    addValue("지원자 서명", [466, 910, 154, 24]);
    addValue("지원 파트", [60, 974, 610, 23],
      {text: value("지원 파트") ? `지원 파트  ${value("지원 파트")}` : ""});

    if (file) {
      photoUrl = URL.createObjectURL(file);
      const image = new Image();
      image.className = "application-value application-photo";
      image.alt = "지원자 증명사진";
      image.src = photoUrl;
      await image.decode();
      place(image, 567, 169, 98, 131);
    }
    appendix.hidden = overflow.childElementCount === 0;
    window.print();
  } catch {
    pdfStatus.textContent = "인쇄용 지원서를 준비하지 못했습니다. 사진 파일을 확인하고 다시 시도해 주세요.";
  } finally {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    printArea.classList.remove("preparing");
    pdfButton.disabled = false;
  }
});
