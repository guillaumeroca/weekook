import svgPaths from "./svg-rm1p3mec4j";

function Logo() {
  return (
    <div className="content-stretch flex flex-col h-[36px] items-start justify-center relative shrink-0" data-name="Logo">
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[1.2] not-italic relative shrink-0 text-[#303044] text-[28px] text-center text-nowrap tracking-[-0.56px] whitespace-pre">WEEKOOK</p>
    </div>
  );
}

function Link() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-name="Link">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.2] not-italic relative shrink-0 text-[#c1a0fd] text-[16px] text-center text-nowrap tracking-[-0.32px] whitespace-pre">Accueil</p>
    </div>
  );
}

function Link1() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-name="Link">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.2] not-italic relative shrink-0 text-[#303044] text-[16px] text-center text-nowrap tracking-[-0.32px] whitespace-pre">&nbsp;</p>
    </div>
  );
}

function Link2() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-name="Link">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.2] not-italic relative shrink-0 text-[#303044] text-[16px] text-center text-nowrap tracking-[-0.32px] whitespace-pre">Tarification</p>
    </div>
  );
}

function FeaturesDropdownIcon() {
  return (
    <div className="relative shrink-0 size-[15px]" data-name="Features Dropdown Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
        <g id="Features Dropdown Icon">
          <path d={svgPaths.p22d41280} id="Chevron down" stroke="var(--stroke-0, #303044)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.125" />
        </g>
      </svg>
    </div>
  );
}

function Link3() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-name="Link">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.2] not-italic relative shrink-0 text-[#303044] text-[16px] text-center text-nowrap tracking-[-0.32px] whitespace-pre">XXX</p>
      <FeaturesDropdownIcon />
    </div>
  );
}

function Link4() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-name="Link">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.2] not-italic relative shrink-0 text-[#303044] text-[16px] text-center text-nowrap tracking-[-0.32px] whitespace-pre">FAQ</p>
    </div>
  );
}

function Link5() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-name="Link">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.2] not-italic relative shrink-0 text-[#303044] text-[16px] text-center text-nowrap tracking-[-0.32px] whitespace-pre">{`A propos de  nous`}</p>
    </div>
  );
}

function NavList() {
  return (
    <div className="content-stretch flex gap-[24px] items-center relative shrink-0" data-name="Nav List">
      <Link />
      <Link1 />
      <Link2 />
      <Link3 />
      <Link4 />
      <Link5 />
    </div>
  );
}

function ArrowRigth() {
  return (
    <div className="absolute inset-[15.67%_15%]" data-name="Arrow rigth">
      <div className="absolute inset-[-7.8%_-7.65%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 10">
          <g id="Arrow rigth">
            <path d={svgPaths.p13842000} id="Vector" stroke="var(--stroke-0, #111125)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.28571" />
            <path d={svgPaths.p11ee7080} id="Vector_2" stroke="var(--stroke-0, #111125)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.28571" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function LineRoundedArrowRigth() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Line Rounded/Arrow rigth">
      <ArrowRigth />
    </div>
  );
}

function PrimaryButton() {
  return (
    <div className="bg-[#c1a0fd] box-border content-stretch flex gap-[8px] h-[48px] items-center justify-center px-[24px] py-[14px] relative rounded-[8px] shrink-0" data-name="Primary Button">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.2] not-italic relative shrink-0 text-[#111125] text-[16px] text-center text-nowrap tracking-[-0.32px] whitespace-pre">Se connecter / S’inscrire</p>
      <LineRoundedArrowRigth />
    </div>
  );
}

function ButtonRow() {
  return (
    <div className="content-stretch flex gap-[16px] items-start justify-end relative shrink-0" data-name="Button Row">
      <PrimaryButton />
    </div>
  );
}

function NavContent() {
  return (
    <div className="content-stretch flex gap-[32px] items-center relative shrink-0" data-name="Nav Content">
      <NavList />
      <ButtonRow />
    </div>
  );
}

function NavbarLight() {
  return (
    <div className="absolute bg-[#f2f4fc] box-border content-stretch flex h-[80px] items-center justify-between left-0 overflow-clip px-[96px] py-[16px] top-0 w-[1440px]" data-name="Navbar-Light">
      <Logo />
      <NavContent />
    </div>
  );
}

function ChevronRight() {
  return (
    <div className="absolute left-[1121.07px] size-[56.235px] top-[334.66px]" data-name="Chevron-Right">
      <div className="absolute inset-0" style={{ "--fill-0": "rgba(193, 160, 253, 1)" } as React.CSSProperties}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 57 57">
          <g id="Chevron-Right">
            <rect fill="var(--fill-0, #C1A0FD)" height="56.2345" rx="28.1173" width="56.2345" />
            <path d={svgPaths.pf81c300} id="Chevron" stroke="var(--stroke-0, #303044)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.63599" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group6() {
  return (
    <div className="absolute contents left-[328px] top-[334px]">
      <div className="absolute bg-[#f3f3f3] h-[55px] left-[328px] rounded-[15.693px] shadow-[0px_6.539px_6.539px_3.269px_rgba(0,0,0,0.25)] top-[334px] w-[244px]" />
    </div>
  );
}

function Group7() {
  return (
    <div className="absolute contents left-[328px] top-[334px]">
      <Group6 />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[1.2] left-[433px] not-italic text-[#303044] text-[20px] text-center text-nowrap top-[349px] tracking-[-0.4px] translate-x-[-50%] whitespace-pre">22 juin 2026</p>
    </div>
  );
}

function Group8() {
  return (
    <div className="absolute contents left-[328px] top-[334px]">
      <Group7 />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents left-[328px] top-[334px]">
      <div className="absolute bg-[#f3f3f3] h-[55px] left-[605px] rounded-[15.693px] shadow-[0px_6.539px_6.539px_3.269px_rgba(0,0,0,0.25)] top-[335px] w-[471px]" />
      <ChevronRight />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[1.2] left-[830.5px] not-italic text-[#7d7d7d] text-[20px] text-center text-nowrap top-[350px] tracking-[-0.4px] translate-x-[-50%] whitespace-pre">{`Je cherche par spécialité, par type, par ville... `}</p>
      <Group8 />
    </div>
  );
}

function Subtitle() {
  return (
    <div className="box-border content-stretch flex gap-[8px] items-center px-0 py-[4px] relative rounded-[4px] shrink-0" data-name="Subtitle">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.5] not-italic relative shrink-0 text-[#cdb3fd] text-[16px] text-nowrap tracking-[2.56px] uppercase whitespace-pre">les personnes</p>
    </div>
  );
}

function Title() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0 w-full" data-name="Title">
      <p className="basis-0 font-['Inter:Semi_Bold',sans-serif] font-semibold grow leading-[1.15] min-h-px min-w-px not-italic relative shrink-0 text-[#111125] text-[40px] text-center tracking-[-0.8px]">Découvrez nos Kookers</p>
    </div>
  );
}

function TitleContainer() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-center relative shrink-0 w-full" data-name="Title Container">
      <Subtitle />
      <Title />
    </div>
  );
}

function Body() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0 w-full" data-name="Body">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.5] not-italic relative shrink-0 text-[#5c5c6f] text-[16px] text-center tracking-[-0.32px] w-[458px]">Des passionnés de cuisine près de chez vous</p>
    </div>
  );
}

function Headings() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-center relative shrink-0 w-full" data-name="Headings">
      <TitleContainer />
      <Body />
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents inset-[80.65%_85.66%_14.45%_8.04%]">
      <div className="absolute inset-[81.12%_85.66%_14.69%_8.04%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
          <circle cx="9" cy="9" fill="var(--fill-0, #828294)" id="Ellipse 1" r="9" />
        </svg>
      </div>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[80.65%_87.06%_14.45%_9.44%] leading-[1.5] not-italic text-[14px] text-nowrap text-white tracking-[-0.28px] whitespace-pre">€</p>
    </div>
  );
}

function Icon() {
  return (
    <div className="absolute left-[10px] size-[30px] top-[10px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
        <g id="Icon">
          <path d={svgPaths.p1bc22100} id="Vector" stroke="var(--stroke-0, #303044)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p261f1900} id="Vector_2" stroke="var(--stroke-0, #303044)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Avatar() {
  return (
    <div className="absolute bg-[#ece2fe] inset-[50.12%_70.63%_38.23%_11.89%] overflow-clip rounded-[30px]" data-name="Avatar">
      <Icon />
    </div>
  );
}

function TuileKooker() {
  return (
    <div className="h-[429px] relative shrink-0 w-[286px]" data-name="tuile kooker">
      <div className="absolute bg-[#f8f9fc] inset-0 rounded-[20px]" />
      <div className="absolute bg-[#f3ecff] inset-[2.1%_3.85%_41.96%_4.2%] rounded-[24px]" />
      <div className="absolute inset-[21.45%_37.41%_61.77%_37.41%]" data-name="Vector">
        <div className="absolute inset-0" style={{ "--fill-0": "rgba(218, 198, 254, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 72 72">
            <path d={svgPaths.p5a2d100} fill="var(--fill-0, #DAC6FE)" id="Vector" />
          </svg>
        </div>
      </div>
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold inset-[63.17%_36.01%_31.24%_8.04%] leading-[1.2] not-italic text-[20px] text-black text-nowrap tracking-[-0.4px] whitespace-pre">Jean Nérianafout</p>
      <p className="[text-underline-position:from-font] absolute decoration-solid font-['Inter:Medium',sans-serif] font-medium inset-[92.77%_34.62%_2.8%_34.97%] leading-[1.2] not-italic text-[16px] text-black text-nowrap tracking-[-0.32px] underline whitespace-pre">Voir le profil</p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[80.65%_62.24%_14.45%_14.34%] leading-[1.5] not-italic text-[14px] text-black text-nowrap tracking-[-0.28px] whitespace-pre">{` 45€/pers.`}</p>
      <Group2 />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[68.76%_79.72%_27.04%_12.24%] leading-[1.5] not-italic text-[#828294] text-[12px] text-nowrap tracking-[-0.24px] whitespace-pre">Ville</p>
      <div className="absolute bg-[rgba(218,198,254,0.48)] inset-[73.19%_56.64%_21.21%_8.04%] rounded-[12px]" />
      <div className="absolute bg-[rgba(218,198,254,0.48)] inset-[73.19%_18.53%_21.21%_46.15%] rounded-[12px]" />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[73.89%_68.88%_21.91%_12.24%] leading-[1.5] not-italic text-[12px] text-nowrap text-violet-600 tracking-[-0.24px] whitespace-pre">Spécialité</p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[73.89%_30.77%_21.91%_50.35%] leading-[1.5] not-italic text-[12px] text-nowrap text-violet-600 tracking-[-0.24px] whitespace-pre">Spécialité</p>
      <div className="absolute inset-[48.95%_68.88%_37.06%_10.14%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 60 60">
          <circle cx="30" cy="30" fill="var(--fill-0, white)" id="Ellipse 2" r="30" />
        </svg>
      </div>
      <Avatar />
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute contents inset-[80.65%_85.66%_14.45%_8.04%]">
      <div className="absolute inset-[81.12%_85.66%_14.69%_8.04%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
          <circle cx="9" cy="9" fill="var(--fill-0, #828294)" id="Ellipse 1" r="9" />
        </svg>
      </div>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[80.65%_87.06%_14.45%_9.44%] leading-[1.5] not-italic text-[14px] text-nowrap text-white tracking-[-0.28px] whitespace-pre">€</p>
    </div>
  );
}

function Icon1() {
  return (
    <div className="absolute left-[10px] size-[30px] top-[10px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
        <g id="Icon">
          <path d={svgPaths.p1bc22100} id="Vector" stroke="var(--stroke-0, #303044)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p261f1900} id="Vector_2" stroke="var(--stroke-0, #303044)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Avatar1() {
  return (
    <div className="absolute bg-[#ece2fe] inset-[50.12%_70.63%_38.23%_11.89%] overflow-clip rounded-[30px]" data-name="Avatar">
      <Icon1 />
    </div>
  );
}

function TuileKooker1() {
  return (
    <div className="h-[429px] relative shrink-0 w-[286px]" data-name="tuile kooker">
      <div className="absolute bg-[#f8f9fc] inset-0 rounded-[20px]" />
      <div className="absolute bg-[#f3ecff] inset-[2.1%_3.85%_41.96%_4.2%] rounded-[24px]" />
      <div className="absolute inset-[21.45%_37.41%_61.77%_37.41%]" data-name="Vector">
        <div className="absolute inset-0" style={{ "--fill-0": "rgba(218, 198, 254, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 72 72">
            <path d={svgPaths.p5a2d100} fill="var(--fill-0, #DAC6FE)" id="Vector" />
          </svg>
        </div>
      </div>
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold inset-[63.17%_26.92%_31.24%_8.04%] leading-[1.2] not-italic text-[20px] text-black text-nowrap tracking-[-0.4px] whitespace-pre">Nadine Houmouque</p>
      <p className="[text-underline-position:from-font] absolute decoration-solid font-['Inter:Medium',sans-serif] font-medium inset-[92.77%_34.62%_2.8%_34.97%] leading-[1.2] not-italic text-[16px] text-black text-nowrap tracking-[-0.32px] underline whitespace-pre">Voir le profil</p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[80.65%_62.24%_14.45%_14.34%] leading-[1.5] not-italic text-[14px] text-black text-nowrap tracking-[-0.28px] whitespace-pre">{` 45€/pers.`}</p>
      <Group3 />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[68.76%_79.72%_27.04%_12.24%] leading-[1.5] not-italic text-[#828294] text-[12px] text-nowrap tracking-[-0.24px] whitespace-pre">Ville</p>
      <div className="absolute bg-[rgba(218,198,254,0.48)] inset-[73.19%_56.64%_21.21%_8.04%] rounded-[12px]" />
      <div className="absolute bg-[rgba(218,198,254,0.48)] inset-[73.19%_18.53%_21.21%_46.15%] rounded-[12px]" />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[73.89%_68.88%_21.91%_12.24%] leading-[1.5] not-italic text-[12px] text-nowrap text-violet-600 tracking-[-0.24px] whitespace-pre">Spécialité</p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[73.89%_30.77%_21.91%_50.35%] leading-[1.5] not-italic text-[12px] text-nowrap text-violet-600 tracking-[-0.24px] whitespace-pre">Spécialité</p>
      <div className="absolute inset-[48.95%_68.88%_37.06%_10.14%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 60 60">
          <circle cx="30" cy="30" fill="var(--fill-0, white)" id="Ellipse 2" r="30" />
        </svg>
      </div>
      <Avatar1 />
    </div>
  );
}

function Group4() {
  return (
    <div className="absolute contents inset-[80.65%_85.66%_14.45%_8.04%]">
      <div className="absolute inset-[81.12%_85.66%_14.69%_8.04%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
          <circle cx="9" cy="9" fill="var(--fill-0, #828294)" id="Ellipse 1" r="9" />
        </svg>
      </div>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[80.65%_87.06%_14.45%_9.44%] leading-[1.5] not-italic text-[14px] text-nowrap text-white tracking-[-0.28px] whitespace-pre">€</p>
    </div>
  );
}

function Icon2() {
  return (
    <div className="absolute left-[10px] size-[30px] top-[10px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
        <g id="Icon">
          <path d={svgPaths.p1bc22100} id="Vector" stroke="var(--stroke-0, #303044)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p261f1900} id="Vector_2" stroke="var(--stroke-0, #303044)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Avatar2() {
  return (
    <div className="absolute bg-[#ece2fe] inset-[50.12%_70.63%_38.23%_11.89%] overflow-clip rounded-[30px]" data-name="Avatar">
      <Icon2 />
    </div>
  );
}

function TuileKooker2() {
  return (
    <div className="h-[429px] relative shrink-0 w-[286px]" data-name="tuile kooker">
      <div className="absolute bg-[#f8f9fc] inset-0 rounded-[20px]" />
      <div className="absolute bg-[#f3ecff] inset-[2.1%_3.85%_41.96%_4.2%] rounded-[24px]" />
      <div className="absolute inset-[21.45%_37.41%_61.77%_37.41%]" data-name="Vector">
        <div className="absolute inset-0" style={{ "--fill-0": "rgba(218, 198, 254, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 72 72">
            <path d={svgPaths.p5a2d100} fill="var(--fill-0, #DAC6FE)" id="Vector" />
          </svg>
        </div>
      </div>
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold inset-[63.17%_39.86%_31.24%_8.04%] leading-[1.2] not-italic text-[20px] text-black text-nowrap tracking-[-0.4px] whitespace-pre">Andy Vojambon</p>
      <p className="[text-underline-position:from-font] absolute decoration-solid font-['Inter:Medium',sans-serif] font-medium inset-[92.77%_34.62%_2.8%_34.97%] leading-[1.2] not-italic text-[16px] text-black text-nowrap tracking-[-0.32px] underline whitespace-pre">Voir le profil</p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[80.65%_62.24%_14.45%_14.34%] leading-[1.5] not-italic text-[14px] text-black text-nowrap tracking-[-0.28px] whitespace-pre">{` 45€/pers.`}</p>
      <Group4 />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[68.76%_79.72%_27.04%_12.24%] leading-[1.5] not-italic text-[#828294] text-[12px] text-nowrap tracking-[-0.24px] whitespace-pre">Ville</p>
      <div className="absolute bg-[rgba(218,198,254,0.48)] inset-[73.19%_56.64%_21.21%_8.04%] rounded-[12px]" />
      <div className="absolute bg-[rgba(218,198,254,0.48)] inset-[73.19%_18.53%_21.21%_46.15%] rounded-[12px]" />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[73.89%_68.88%_21.91%_12.24%] leading-[1.5] not-italic text-[12px] text-nowrap text-violet-600 tracking-[-0.24px] whitespace-pre">Spécialité</p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[73.89%_30.77%_21.91%_50.35%] leading-[1.5] not-italic text-[12px] text-nowrap text-violet-600 tracking-[-0.24px] whitespace-pre">Spécialité</p>
      <div className="absolute inset-[48.95%_68.88%_37.06%_10.14%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 60 60">
          <circle cx="30" cy="30" fill="var(--fill-0, white)" id="Ellipse 2" r="30" />
        </svg>
      </div>
      <Avatar2 />
    </div>
  );
}

function Group5() {
  return (
    <div className="absolute contents inset-[80.65%_85.66%_14.45%_8.04%]">
      <div className="absolute inset-[81.12%_85.66%_14.69%_8.04%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
          <circle cx="9" cy="9" fill="var(--fill-0, #828294)" id="Ellipse 1" r="9" />
        </svg>
      </div>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[80.65%_87.06%_14.45%_9.44%] leading-[1.5] not-italic text-[14px] text-nowrap text-white tracking-[-0.28px] whitespace-pre">€</p>
    </div>
  );
}

function Icon3() {
  return (
    <div className="absolute left-[10px] size-[30px] top-[10px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
        <g id="Icon">
          <path d={svgPaths.p1bc22100} id="Vector" stroke="var(--stroke-0, #303044)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p261f1900} id="Vector_2" stroke="var(--stroke-0, #303044)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Avatar3() {
  return (
    <div className="absolute bg-[#ece2fe] inset-[50.12%_70.63%_38.23%_11.89%] overflow-clip rounded-[30px]" data-name="Avatar">
      <Icon3 />
    </div>
  );
}

function TuileKooker3() {
  return (
    <div className="h-[429px] relative shrink-0 w-[286px]" data-name="tuile kooker">
      <div className="absolute bg-[#f8f9fc] inset-0 rounded-[20px]" />
      <div className="absolute bg-[#f3ecff] inset-[2.1%_3.85%_41.96%_4.2%] rounded-[24px]" />
      <div className="absolute inset-[21.45%_37.41%_61.77%_37.41%]" data-name="Vector">
        <div className="absolute inset-0" style={{ "--fill-0": "rgba(218, 198, 254, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 72 72">
            <path d={svgPaths.p5a2d100} fill="var(--fill-0, #DAC6FE)" id="Vector" />
          </svg>
        </div>
      </div>
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold inset-[63.17%_11.54%_31.24%_8.04%] leading-[1.2] not-italic text-[20px] text-black text-nowrap tracking-[-0.4px] whitespace-pre">Jessica Naite-Danlefrigo</p>
      <p className="[text-underline-position:from-font] absolute decoration-solid font-['Inter:Medium',sans-serif] font-medium inset-[92.77%_34.62%_2.8%_34.97%] leading-[1.2] not-italic text-[16px] text-black text-nowrap tracking-[-0.32px] underline whitespace-pre">Voir le profil</p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[80.65%_62.24%_14.45%_14.34%] leading-[1.5] not-italic text-[14px] text-black text-nowrap tracking-[-0.28px] whitespace-pre">{` 45€/pers.`}</p>
      <Group5 />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[68.76%_79.72%_27.04%_12.24%] leading-[1.5] not-italic text-[#828294] text-[12px] text-nowrap tracking-[-0.24px] whitespace-pre">Ville</p>
      <div className="absolute bg-[rgba(218,198,254,0.48)] inset-[73.19%_56.64%_21.21%_8.04%] rounded-[12px]" />
      <div className="absolute bg-[rgba(218,198,254,0.48)] inset-[73.19%_18.53%_21.21%_46.15%] rounded-[12px]" />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[73.89%_68.88%_21.91%_12.24%] leading-[1.5] not-italic text-[12px] text-nowrap text-violet-600 tracking-[-0.24px] whitespace-pre">Spécialité</p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[73.89%_30.77%_21.91%_50.35%] leading-[1.5] not-italic text-[12px] text-nowrap text-violet-600 tracking-[-0.24px] whitespace-pre">Spécialité</p>
      <div className="absolute inset-[48.95%_68.88%_37.06%_10.14%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 60 60">
          <circle cx="30" cy="30" fill="var(--fill-0, white)" id="Ellipse 2" r="30" />
        </svg>
      </div>
      <Avatar3 />
    </div>
  );
}

function Container() {
  return (
    <div className="box-border content-stretch flex gap-[24px] items-center justify-center px-0 py-[24px] relative shrink-0 w-full" data-name="Container">
      <TuileKooker />
      <TuileKooker1 />
      <TuileKooker2 />
      <TuileKooker3 />
    </div>
  );
}

function Container1() {
  return (
    <div className="bg-white relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="box-border content-stretch flex flex-col gap-[48px] items-center justify-center px-[96px] py-[64px] relative w-full">
          <Headings />
          <Container />
        </div>
      </div>
    </div>
  );
}

function CardsLight() {
  return (
    <div className="absolute content-stretch flex flex-col items-center left-0 overflow-clip top-[477px] w-[1440px]" data-name="Cards-Light">
      <Container1 />
    </div>
  );
}

function ArrowRigth1() {
  return (
    <div className="absolute inset-[15.67%_15%]" data-name="Arrow rigth">
      <div className="absolute inset-[-7.8%_-7.65%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 10">
          <g id="Arrow rigth">
            <path d={svgPaths.p13842000} id="Vector" stroke="var(--stroke-0, #111125)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.28571" />
            <path d={svgPaths.p11ee7080} id="Vector_2" stroke="var(--stroke-0, #111125)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.28571" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function LineRoundedArrowRigth1() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Line Rounded/Arrow rigth">
      <ArrowRigth1 />
    </div>
  );
}

function PrimaryButton1() {
  return (
    <div className="absolute bg-[#c1a0fd] box-border content-stretch flex gap-[8px] h-[48px] items-center justify-center left-[607px] px-[24px] py-[14px] rounded-[8px] top-[1242px]" data-name="Primary Button">
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[1.2] not-italic relative shrink-0 text-[#111125] text-[16px] text-center text-nowrap tracking-[-0.32px] whitespace-pre">Voir tous les Kookers</p>
      <LineRoundedArrowRigth1 />
    </div>
  );
}

function Subtitle1() {
  return (
    <div className="box-border content-stretch flex gap-[8px] items-center px-0 py-[4px] relative rounded-[4px] shrink-0" data-name="Subtitle">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.5] not-italic relative shrink-0 text-[#cdb3fd] text-[16px] text-nowrap tracking-[2.56px] uppercase whitespace-pre">ON EN PARLE</p>
    </div>
  );
}

function Title1() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="Title">
      <p className="basis-0 font-['Inter:Semi_Bold',sans-serif] font-semibold grow leading-[1.15] min-h-px min-w-px not-italic relative shrink-0 text-[#111125] text-[40px] tracking-[-0.8px]">
        Ce que disent
        <br aria-hidden="true" />
        nos utilisateurs
      </p>
    </div>
  );
}

function TitleContainer1() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Title Container">
      <Subtitle1 />
      <Title1 />
    </div>
  );
}

function Body1() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="Body">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.5] not-italic relative shrink-0 text-[#828294] text-[16px] tracking-[-0.32px] w-[376px]">Découvrez les avis et les expériences de notre communauté WEEKOOK !</p>
    </div>
  );
}

function Headings1() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Headings">
      <TitleContainer1 />
      <Body1 />
    </div>
  );
}

function PreviousButton() {
  return (
    <div className="relative shrink-0 size-[48px]" data-name="Previous Button">
      <div className="absolute inset-0" style={{ "--fill-0": "rgba(243, 236, 255, 1)" } as React.CSSProperties}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
          <g id="Previous Button">
            <rect fill="var(--fill-0, #F3ECFF)" height="48" rx="24" width="48" />
            <path d="M28 32L20 24L28 16" id="Chevron" stroke="var(--stroke-0, #303044)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.25" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function NextButton() {
  return (
    <div className="relative shrink-0 size-[48px]" data-name="Next Button">
      <div className="absolute inset-0" style={{ "--fill-0": "rgba(193, 160, 253, 1)" } as React.CSSProperties}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
          <g id="Next Button">
            <rect fill="var(--fill-0, #C1A0FD)" height="48" rx="24" width="48" />
            <path d="M20 16L28 24L20 32" id="Chevron" stroke="var(--stroke-0, #303044)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.25" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Navigation() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="Navigation">
      <PreviousButton />
      <NextButton />
    </div>
  );
}

function TextContent() {
  return (
    <div className="content-stretch flex flex-col gap-[48px] items-start relative shrink-0 w-full" data-name="Text Content">
      <Headings1 />
      <Navigation />
    </div>
  );
}

function Content() {
  return (
    <div className="content-stretch flex flex-col h-full items-start justify-center relative shrink-0 w-[429px]" data-name="Content">
      <TextContent />
    </div>
  );
}

function ImageIcon() {
  return <div className="shrink-0 size-[88px]" data-name="Image-Icon" />;
}

function Image() {
  return (
    <div className="bg-[#f3ecff] h-[404px] relative rounded-[16px] shrink-0 w-full" data-name="Image">
      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="box-border content-stretch flex gap-[80px] h-[404px] items-center justify-center pb-[120px] pt-[8px] px-[96px] relative w-full">
          <ImageIcon />
        </div>
      </div>
    </div>
  );
}

function Icon4() {
  return (
    <div className="absolute left-[10px] size-[30px] top-[10px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
        <g id="Icon">
          <path d={svgPaths.p1bc22100} id="Vector" stroke="var(--stroke-0, #303044)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p261f1900} id="Vector_2" stroke="var(--stroke-0, #303044)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Avatar4() {
  return (
    <div className="bg-[#ece2fe] overflow-clip relative rounded-[30px] shrink-0 size-[50px]" data-name="Avatar">
      <Icon4 />
    </div>
  );
}

function Profile() {
  return (
    <div className="content-stretch flex gap-[16px] h-[50px] items-start justify-end relative shrink-0" data-name="Profile">
      <Avatar4 />
    </div>
  );
}

function ListItem() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="List Item">
      <p className="basis-0 font-['Inter:Semi_Bold',sans-serif] font-semibold grow leading-[1.15] min-h-px min-w-px not-italic relative shrink-0 text-[#303044] text-[20px] tracking-[-0.4px]">John Doe</p>
    </div>
  );
}

function ListItem1() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="List Item">
      <p className="basis-0 font-['Inter:Regular',sans-serif] font-normal grow leading-[1.5] min-h-px min-w-px not-italic relative shrink-0 text-[#5c5c6f] text-[16px] tracking-[-0.32px]">Marseille</p>
    </div>
  );
}

function ListItem2() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[8px] grow items-start min-h-px min-w-px relative shrink-0" data-name="List Item">
      <ListItem />
      <ListItem1 />
    </div>
  );
}

function ProfileInfo() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="Profile Info">
      <Profile />
      <ListItem2 />
    </div>
  );
}

function TitleContainer2() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Title Container">
      <ProfileInfo />
    </div>
  );
}

function Content1() {
  return (
    <div className="absolute bg-white box-border content-stretch flex flex-col gap-[24px] h-[356px] items-center justify-end left-[16px] p-[16px] rounded-[12px] top-[32px] w-[262px]" data-name="Content">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.5] not-italic relative shrink-0 text-[#5c5c6f] text-[16px] tracking-[-0.32px] w-full">{`doaudh daudh azdiudh iduha doiuahd oaiduh dzaoiudh aoidh adoiuhd doaudh daudh azdiudh iduha doiuahd oaiduh dzaoiudh aoidh adoiuhd doaudh daudh azdiudh iduha doiuahd oaiduh dzaoiudh aoidh adoiuhd doaudh daudh azdiudh iduha doiuahd oaiduh dzaoiudh aoidh adoiuhd `}</p>
      <TitleContainer2 />
    </div>
  );
}

function Card() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] h-[404px] items-start overflow-clip relative rounded-[16px] shrink-0 w-[294px]" data-name="Card">
      <Image />
      <Content1 />
    </div>
  );
}

function ImageIcon1() {
  return (
    <div className="relative shrink-0 size-[88px]" data-name="Image-Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 88 88">
        <g id="Image-Icon">
          <path d={svgPaths.p21a6dd80} fill="var(--fill-0, #CDB3FD)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Image1() {
  return (
    <div className="bg-[#f3ecff] h-[404px] relative rounded-[16px] shrink-0 w-full" data-name="Image">
      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="box-border content-stretch flex gap-[80px] h-[404px] items-center justify-center pb-[120px] pt-[8px] px-[96px] relative w-full">
          <ImageIcon1 />
        </div>
      </div>
    </div>
  );
}

function Icon5() {
  return (
    <div className="absolute left-[10px] size-[30px] top-[10px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
        <g id="Icon">
          <path d={svgPaths.p1bc22100} id="Vector" stroke="var(--stroke-0, #303044)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p261f1900} id="Vector_2" stroke="var(--stroke-0, #303044)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Avatar5() {
  return (
    <div className="bg-[#ece2fe] overflow-clip relative rounded-[30px] shrink-0 size-[50px]" data-name="Avatar">
      <Icon5 />
    </div>
  );
}

function Profile1() {
  return (
    <div className="content-stretch flex gap-[16px] h-[50px] items-start justify-end relative shrink-0" data-name="Profile">
      <Avatar5 />
    </div>
  );
}

function ListItem3() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="List Item">
      <p className="basis-0 font-['Inter:Semi_Bold',sans-serif] font-semibold grow leading-[1.15] min-h-px min-w-px not-italic relative shrink-0 text-[#303044] text-[20px] tracking-[-0.4px]">Sarah Johnson</p>
    </div>
  );
}

function ListItem4() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="List Item">
      <p className="basis-0 font-['Inter:Regular',sans-serif] font-normal grow leading-[1.5] min-h-px min-w-px not-italic relative shrink-0 text-[#5c5c6f] text-[16px] tracking-[-0.32px]">Founder, Creative Co.</p>
    </div>
  );
}

function ListItem5() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[8px] grow items-start min-h-px min-w-px relative shrink-0" data-name="List Item">
      <ListItem3 />
      <ListItem4 />
    </div>
  );
}

function ProfileInfo1() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="Profile Info">
      <Profile1 />
      <ListItem5 />
    </div>
  );
}

function TitleContainer3() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Title Container">
      <ProfileInfo1 />
    </div>
  );
}

function Content2() {
  return (
    <div className="absolute bg-white box-border content-stretch flex flex-col gap-[24px] items-center justify-end left-[16px] p-[16px] rounded-[12px] top-[301px] w-[262px]" data-name="Content">
      <TitleContainer3 />
    </div>
  );
}

function Card1() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] h-[404px] items-start overflow-clip relative rounded-[16px] shrink-0 w-[294px]" data-name="Card">
      <Image1 />
      <Content2 />
    </div>
  );
}

function ImageIcon2() {
  return (
    <div className="relative shrink-0 size-[88px]" data-name="Image-Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 88 88">
        <g id="Image-Icon">
          <path d={svgPaths.p21a6dd80} fill="var(--fill-0, #CDB3FD)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Image2() {
  return (
    <div className="bg-[#f3ecff] h-[404px] relative rounded-[16px] shrink-0 w-full" data-name="Image">
      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="box-border content-stretch flex gap-[80px] h-[404px] items-center justify-center pb-[120px] pt-[8px] px-[96px] relative w-full">
          <ImageIcon2 />
        </div>
      </div>
    </div>
  );
}

function Icon6() {
  return (
    <div className="absolute left-[10px] size-[30px] top-[10px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
        <g id="Icon">
          <path d={svgPaths.p1bc22100} id="Vector" stroke="var(--stroke-0, #303044)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p261f1900} id="Vector_2" stroke="var(--stroke-0, #303044)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Avatar6() {
  return (
    <div className="bg-[#ece2fe] overflow-clip relative rounded-[30px] shrink-0 size-[50px]" data-name="Avatar">
      <Icon6 />
    </div>
  );
}

function Profile2() {
  return (
    <div className="content-stretch flex gap-[16px] h-[50px] items-start justify-end relative shrink-0" data-name="Profile">
      <Avatar6 />
    </div>
  );
}

function ListItem6() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="List Item">
      <p className="basis-0 font-['Inter:Semi_Bold',sans-serif] font-semibold grow leading-[1.15] min-h-px min-w-px not-italic relative shrink-0 text-[#303044] text-[20px] tracking-[-0.4px]">Jane Smith</p>
    </div>
  );
}

function ListItem7() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="List Item">
      <p className="basis-0 font-['Inter:Regular',sans-serif] font-normal grow leading-[1.5] min-h-px min-w-px not-italic relative shrink-0 text-[#5c5c6f] text-[16px] tracking-[-0.32px]">CEO, XYZ Corp</p>
    </div>
  );
}

function ListItem8() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[8px] grow items-start min-h-px min-w-px relative shrink-0" data-name="List Item">
      <ListItem6 />
      <ListItem7 />
    </div>
  );
}

function ProfileInfo2() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="Profile Info">
      <Profile2 />
      <ListItem8 />
    </div>
  );
}

function TitleContainer4() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Title Container">
      <ProfileInfo2 />
    </div>
  );
}

function Content3() {
  return (
    <div className="absolute bg-white box-border content-stretch flex flex-col gap-[24px] items-center justify-end left-[16px] p-[16px] rounded-[12px] top-[301px] w-[262px]" data-name="Content">
      <TitleContainer4 />
    </div>
  );
}

function Card2() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] h-[404px] items-start overflow-clip relative rounded-[16px] shrink-0 w-[294px]" data-name="Card">
      <Image2 />
      <Content3 />
    </div>
  );
}

function Container2() {
  return (
    <div className="bg-[#f8f9fc] relative rounded-[24px] shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="box-border content-stretch flex gap-[16px] items-center p-[48px] relative w-full">
          <div className="flex flex-row items-center self-stretch">
            <Content />
          </div>
          <Card />
          <Card1 />
          <Card2 />
        </div>
      </div>
    </div>
  );
}

function TestimonialsLight() {
  return (
    <div className="absolute bg-white box-border content-stretch flex flex-col gap-[48px] items-center left-0 px-[96px] py-[64px] top-[1290px] w-[1440px]" data-name="Testimonials-Light">
      <Container2 />
    </div>
  );
}

function Subtitle2() {
  return (
    <div className="box-border content-stretch flex gap-[8px] items-center px-0 py-[4px] relative rounded-[4px] shrink-0 w-[272px]" data-name="Subtitle">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold h-[24px] leading-[1.5] not-italic relative shrink-0 text-[#cdb3fd] text-[16px] tracking-[2.56px] uppercase w-[237px]">Je suis un KOOKER !</p>
    </div>
  );
}

function Title2() {
  return (
    <div className="content-stretch flex gap-[8px] h-[115px] items-start relative shrink-0 w-full" data-name="Title">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.15] not-italic relative shrink-0 text-[#111125] text-[48px] tracking-[-0.96px] w-[680px]">Envie de partager votre savoir-faire ? Rejoignez Weekook !</p>
    </div>
  );
}

function TitleContainer5() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[16px] grow items-start min-h-px min-w-px relative shrink-0" data-name="Title Container">
      <Subtitle2 />
      <Title2 />
    </div>
  );
}

function Body2() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="Body">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.5] not-italic relative shrink-0 text-[#5c5c6f] text-[16px] tracking-[-0.32px] w-[439px]">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius elementum tristique. Duis cursus, mi quis viverra ut commodo diam libero vitae erat.</p>
    </div>
  );
}

function ArrowRigth2() {
  return (
    <div className="absolute inset-[15.67%_15%]" data-name="Arrow rigth">
      <div className="absolute inset-[-7.8%_-7.65%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 10">
          <g id="Arrow rigth">
            <path d={svgPaths.p13842000} id="Vector" stroke="var(--stroke-0, #111125)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.28571" />
            <path d={svgPaths.p11ee7080} id="Vector_2" stroke="var(--stroke-0, #111125)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.28571" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function LineRoundedArrowRigth2() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Line Rounded/Arrow rigth">
      <ArrowRigth2 />
    </div>
  );
}

function PrimaryButton2() {
  return (
    <div className="bg-[#c1a0fd] box-border content-stretch flex gap-[8px] h-[48px] items-center justify-center px-[24px] py-[14px] relative rounded-[8px] shrink-0" data-name="Primary Button">
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[1.2] not-italic relative shrink-0 text-[#111125] text-[16px] text-center text-nowrap tracking-[-0.32px] whitespace-pre">S’inscrire gratuitement</p>
      <LineRoundedArrowRigth2 />
    </div>
  );
}

function SecondaryButton() {
  return (
    <div className="box-border content-stretch flex gap-[3px] h-[48px] items-center justify-center px-[24px] py-[15px] relative rounded-[8px] shrink-0" data-name="Secondary Button">
      <div aria-hidden="true" className="absolute border border-[#111125] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[1.2] not-italic relative shrink-0 text-[#111125] text-[16px] text-center text-nowrap tracking-[-0.32px] whitespace-pre">Se connecter</p>
    </div>
  );
}

function ButtonRow1() {
  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0" data-name="Button Row">
      <PrimaryButton2 />
      <SecondaryButton />
    </div>
  );
}

function Content4() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-start justify-center relative shrink-0 w-[439px]" data-name="Content">
      <Body2 />
      <ButtonRow1 />
    </div>
  );
}

function Headings2() {
  return (
    <div className="basis-0 content-stretch flex gap-[24px] grow items-end min-h-px min-w-px relative shrink-0" data-name="Headings">
      <TitleContainer5 />
      <Content4 />
    </div>
  );
}

function TextContent1() {
  return (
    <div className="basis-0 content-stretch flex gap-[48px] grow items-center justify-center min-h-px min-w-px relative shrink-0" data-name="Text Content">
      <Headings2 />
    </div>
  );
}

function Container3() {
  return (
    <div className="bg-[#f8f9fc] h-[323px] relative rounded-[16px] shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="box-border content-stretch flex gap-[48px] h-[323px] items-center justify-center px-[96px] py-[48px] relative w-full">
          <TextContent1 />
        </div>
      </div>
    </div>
  );
}

function CtaLight() {
  return (
    <div className="absolute content-stretch flex flex-col h-[323px] items-center left-0 overflow-clip top-[1918px] w-[1440px]" data-name="CTA-Light">
      <Container3 />
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents left-0 top-[1918px]">
      <CtaLight />
    </div>
  );
}

function S4Inscrire() {
  return (
    <div className="absolute contents left-0 top-[1918px]" data-name="S4INSCRIRE">
      <Group1 />
    </div>
  );
}

function Subtitle3() {
  return (
    <div className="box-border content-stretch flex gap-[8px] items-center px-0 py-[4px] relative rounded-[4px] shrink-0" data-name="Subtitle">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.5] not-italic relative shrink-0 text-[#cdb3fd] text-[16px] text-nowrap tracking-[2.56px] uppercase whitespace-pre">dES infos ?</p>
    </div>
  );
}

function Title3() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0 w-full" data-name="Title">
      <p className="basis-0 font-['Inter:Semi_Bold',sans-serif] font-semibold grow leading-[1.15] min-h-px min-w-px not-italic relative shrink-0 text-[#111125] text-[48px] text-center tracking-[-0.96px]">
        Vous avez des questions ?<br aria-hidden="true" />
        On peut certainement y répondre :)
      </p>
    </div>
  );
}

function TitleContainer6() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-center relative shrink-0 w-full" data-name="Title Container">
      <Subtitle3 />
      <Title3 />
    </div>
  );
}

function Body3() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0 w-full" data-name="Body">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.5] not-italic relative shrink-0 text-[#5c5c6f] text-[16px] text-center tracking-[-0.32px] w-[653px]">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius elementum tristique. Duis cursus, mi quis viverra ut commodo diam libero vitae erat.</p>
    </div>
  );
}

function Headings3() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-center relative shrink-0 w-full" data-name="Headings">
      <TitleContainer6 />
      <Body3 />
    </div>
  );
}

function ArrowRigth3() {
  return (
    <div className="absolute inset-[15.67%_15%]" data-name="Arrow rigth">
      <div className="absolute inset-[-7.8%_-7.65%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 10">
          <g id="Arrow rigth">
            <path d={svgPaths.p13842000} id="Vector" stroke="var(--stroke-0, #111125)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.28571" />
            <path d={svgPaths.p11ee7080} id="Vector_2" stroke="var(--stroke-0, #111125)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.28571" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function LineRoundedArrowRigth3() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Line Rounded/Arrow rigth">
      <ArrowRigth3 />
    </div>
  );
}

function PrimaryButton3() {
  return (
    <div className="bg-[#c1a0fd] box-border content-stretch flex gap-[8px] h-[48px] items-center justify-center px-[24px] py-[14px] relative rounded-[8px] shrink-0" data-name="Primary Button">
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[1.2] not-italic relative shrink-0 text-[#111125] text-[16px] text-center text-nowrap tracking-[-0.32px] whitespace-pre">Je m’inscris</p>
      <LineRoundedArrowRigth3 />
    </div>
  );
}

function SecondaryButton1() {
  return (
    <div className="box-border content-stretch flex gap-[3px] h-[48px] items-center justify-center px-[24px] py-[15px] relative rounded-[8px] shrink-0" data-name="Secondary Button">
      <div aria-hidden="true" className="absolute border border-[#111125] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[1.2] not-italic relative shrink-0 text-[#111125] text-[16px] text-center text-nowrap tracking-[-0.32px] whitespace-pre">En savoir plus</p>
    </div>
  );
}

function ButtonRow2() {
  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0" data-name="Button Row">
      <PrimaryButton3 />
      <SecondaryButton1 />
    </div>
  );
}

function TextContent2() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-center relative shrink-0 w-full" data-name="Text Content">
      <Headings3 />
      <ButtonRow2 />
    </div>
  );
}

function Plus() {
  return (
    <div className="absolute inset-[12.5%]" data-name="Plus">
      <div className="absolute inset-[-6.67%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 17">
          <g id="Plus">
            <path d="M8.5 1V16" id="Vector" stroke="var(--stroke-0, #111125)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            <path d="M16 8.5H1" id="Vector_2" stroke="var(--stroke-0, #111125)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Icon7() {
  return (
    <div className="overflow-clip relative shrink-0 size-[20px]" data-name="Icon">
      <Plus />
    </div>
  );
}

function AccordionTop() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Accordion Top">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.15] not-italic relative shrink-0 text-[#303044] text-[24px] text-nowrap tracking-[-0.48px] whitespace-pre">What services do you offer?</p>
      <Icon7 />
    </div>
  );
}

function AccordionContent() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Accordion Content">
      <AccordionTop />
    </div>
  );
}

function AccordionCard() {
  return (
    <div className="bg-[#f8f9fc] relative rounded-[16px] shrink-0 w-full" data-name="Accordion Card">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="box-border content-stretch flex flex-col items-start px-[24px] py-[32px] relative w-full">
          <AccordionContent />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#e6d9fe] border-solid inset-0 pointer-events-none rounded-[16px]" />
    </div>
  );
}

function Accordion() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Accordion">
      <AccordionCard />
    </div>
  );
}

function Close() {
  return (
    <div className="absolute inset-[17.5%]" data-name="Close">
      <div className="absolute inset-[-7.69%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
          <g id="Close">
            <path d="M14 1L1 14" id="Vector" stroke="var(--stroke-0, #111125)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            <path d="M1 1L14 14" id="Vector_2" stroke="var(--stroke-0, #111125)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Icon8() {
  return (
    <div className="overflow-clip relative shrink-0 size-[20px]" data-name="Icon">
      <Close />
    </div>
  );
}

function AccordionTop1() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Accordion Top">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.15] not-italic relative shrink-0 text-[#303044] text-[24px] text-nowrap tracking-[-0.48px] whitespace-pre">How long does it take to complete a project?</p>
      <Icon8 />
    </div>
  );
}

function AccordionContent1() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Accordion Content">
      <AccordionTop1 />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.5] not-italic relative shrink-0 text-[#5c5c6f] text-[14px] tracking-[-0.28px] w-full">Lorem ipsum dolor sit amet, consectetur cdolor col adipiscing elit. Integer mattis nunc augue vel lacinia erat euismod ut. Sed eleifend tellus nonole tincidunt aliquet. Fusce aliquam mi felis.</p>
    </div>
  );
}

function AccordionCard1() {
  return (
    <div className="bg-[#f2f4fc] relative rounded-[16px] shrink-0 w-full" data-name="Accordion Card">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="box-border content-stretch flex flex-col items-start px-[24px] py-[32px] relative w-full">
          <AccordionContent1 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#c1a0fd] border-solid inset-0 pointer-events-none rounded-[16px]" />
    </div>
  );
}

function Accordion1() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Accordion">
      <AccordionCard1 />
    </div>
  );
}

function Plus1() {
  return (
    <div className="absolute inset-[12.5%]" data-name="Plus">
      <div className="absolute inset-[-6.67%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 17">
          <g id="Plus">
            <path d="M8.5 1V16" id="Vector" stroke="var(--stroke-0, #111125)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            <path d="M16 8.5H1" id="Vector_2" stroke="var(--stroke-0, #111125)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Icon9() {
  return (
    <div className="overflow-clip relative shrink-0 size-[20px]" data-name="Icon">
      <Plus1 />
    </div>
  );
}

function AccordionTop2() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Accordion Top">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.15] not-italic relative shrink-0 text-[#303044] text-[24px] text-nowrap tracking-[-0.48px] whitespace-pre">What industries do you work with?</p>
      <Icon9 />
    </div>
  );
}

function AccordionContent2() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Accordion Content">
      <AccordionTop2 />
    </div>
  );
}

function AccordionCard2() {
  return (
    <div className="bg-[#f8f9fc] relative rounded-[16px] shrink-0 w-full" data-name="Accordion Card">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="box-border content-stretch flex flex-col items-start px-[24px] py-[32px] relative w-full">
          <AccordionContent2 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#e6d9fe] border-solid inset-0 pointer-events-none rounded-[16px]" />
    </div>
  );
}

function Accordion2() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Accordion">
      <AccordionCard2 />
    </div>
  );
}

function Plus2() {
  return (
    <div className="absolute inset-[12.5%]" data-name="Plus">
      <div className="absolute inset-[-6.67%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 17">
          <g id="Plus">
            <path d="M8.5 1V16" id="Vector" stroke="var(--stroke-0, #111125)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            <path d="M16 8.5H1" id="Vector_2" stroke="var(--stroke-0, #111125)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Icon10() {
  return (
    <div className="overflow-clip relative shrink-0 size-[20px]" data-name="Icon">
      <Plus2 />
    </div>
  );
}

function AccordionTop3() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Accordion Top">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.15] not-italic relative shrink-0 text-[#303044] text-[24px] text-nowrap tracking-[-0.48px] whitespace-pre">How do you ensure quality in your work?</p>
      <Icon10 />
    </div>
  );
}

function AccordionContent3() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Accordion Content">
      <AccordionTop3 />
    </div>
  );
}

function AccordionCard3() {
  return (
    <div className="bg-[#f8f9fc] relative rounded-[16px] shrink-0 w-full" data-name="Accordion Card">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="box-border content-stretch flex flex-col items-start px-[24px] py-[32px] relative w-full">
          <AccordionContent3 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#e6d9fe] border-solid inset-0 pointer-events-none rounded-[16px]" />
    </div>
  );
}

function Accordion3() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Accordion">
      <AccordionCard3 />
    </div>
  );
}

function Plus3() {
  return (
    <div className="absolute inset-[12.5%]" data-name="Plus">
      <div className="absolute inset-[-6.67%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 17">
          <g id="Plus">
            <path d="M8.5 1V16" id="Vector" stroke="var(--stroke-0, #111125)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            <path d="M16 8.5H1" id="Vector_2" stroke="var(--stroke-0, #111125)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Icon11() {
  return (
    <div className="overflow-clip relative shrink-0 size-[20px]" data-name="Icon">
      <Plus3 />
    </div>
  );
}

function AccordionTop4() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Accordion Top">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.15] not-italic relative shrink-0 text-[#303044] text-[24px] text-nowrap tracking-[-0.48px] whitespace-pre">Can I customize the services to fit my needs?</p>
      <Icon11 />
    </div>
  );
}

function AccordionContent4() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Accordion Content">
      <AccordionTop4 />
    </div>
  );
}

function AccordionCard4() {
  return (
    <div className="bg-[#f8f9fc] relative rounded-[16px] shrink-0 w-full" data-name="Accordion Card">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="box-border content-stretch flex flex-col items-start px-[24px] py-[32px] relative w-full">
          <AccordionContent4 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#e6d9fe] border-solid inset-0 pointer-events-none rounded-[16px]" />
    </div>
  );
}

function Accordion4() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Accordion">
      <AccordionCard4 />
    </div>
  );
}

function Container4() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col items-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[24px] items-center px-[120px] py-0 relative w-full">
          <Accordion />
          <Accordion1 />
          <Accordion2 />
          <Accordion3 />
          <Accordion4 />
        </div>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="bg-white relative shrink-0 w-full" data-name="Container">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="box-border content-stretch flex flex-col gap-[64px] items-start px-[96px] py-[64px] relative w-full">
          <TextContent2 />
          <Container4 />
        </div>
      </div>
    </div>
  );
}

function FaqLight() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 overflow-clip top-[2241px] w-[1440px]" data-name="FAQ-Light">
      <Container5 />
    </div>
  );
}

function Links() {
  return (
    <div className="content-stretch flex flex-col font-['Inter:Bold',sans-serif] font-bold gap-[8px] items-start leading-[1.5] not-italic relative shrink-0 text-[#828294] text-[12px] text-nowrap tracking-[-0.24px] w-full whitespace-pre" data-name="Links">
      <p className="relative shrink-0">Accueil</p>
      <p className="relative shrink-0">A propos de nous</p>
      <p className="relative shrink-0">Recherche</p>
      <p className="relative shrink-0">Se connecter</p>
    </div>
  );
}

function LinksColumn() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0" data-name="Links Column">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.5] not-italic relative shrink-0 text-[#303044] text-[16px] text-nowrap tracking-[2.56px] uppercase whitespace-pre">Liens rapides</p>
      <Links />
    </div>
  );
}

function Links1() {
  return (
    <div className="content-stretch flex flex-col font-['Inter:Bold',sans-serif] font-bold gap-[8px] items-start leading-[1.5] not-italic relative shrink-0 text-[#828294] text-[12px] text-nowrap tracking-[-0.24px] w-full whitespace-pre" data-name="Links">
      <p className="relative shrink-0">Notre histoire</p>
      <p className="relative shrink-0">Meet the Team</p>
      <p className="relative shrink-0">Careers</p>
      <p className="relative shrink-0">Nos</p>
    </div>
  );
}

function LinksColumn1() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0" data-name="Links Column">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.5] not-italic relative shrink-0 text-[#303044] text-[16px] text-nowrap tracking-[2.56px] uppercase whitespace-pre">Découvrir</p>
      <Links1 />
    </div>
  );
}

function Links2() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start leading-[1.5] not-italic relative shrink-0 text-[#828294] text-[12px] text-nowrap tracking-[-0.24px] w-full whitespace-pre" data-name="Links">
      <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0">FAQ</p>
      <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0">Contact</p>
      <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0">Les Kookers Guides !</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0">&nbsp;</p>
    </div>
  );
}

function LinksColumn2() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0" data-name="Links Column">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.5] not-italic relative shrink-0 text-[#303044] text-[16px] text-nowrap tracking-[2.56px] uppercase whitespace-pre">AIDE</p>
      <Links2 />
    </div>
  );
}

function Links3() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start leading-[1.5] not-italic relative shrink-0 text-[#828294] text-[12px] text-nowrap tracking-[-0.24px] w-full whitespace-pre" data-name="Links">
      <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0">CGU</p>
      <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0">Privacy Policy ou pas</p>
      <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0">Gestion des cookies</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0">&nbsp;</p>
    </div>
  );
}

function LinksColumn3() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0" data-name="Links Column">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.5] not-italic relative shrink-0 text-[#303044] text-[16px] text-nowrap tracking-[2.56px] uppercase whitespace-pre">legal</p>
      <Links3 />
    </div>
  );
}

function FooterLinks() {
  return (
    <div className="content-stretch flex gap-[72px] items-start relative shrink-0" data-name="Footer Links">
      <LinksColumn />
      <LinksColumn1 />
      <LinksColumn2 />
      <LinksColumn3 />
    </div>
  );
}

function ArrowRigth4() {
  return (
    <div className="absolute inset-[15.67%_15%]" data-name="Arrow rigth">
      <div className="absolute inset-[-7.8%_-7.65%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 10">
          <g id="Arrow rigth">
            <path d={svgPaths.p13842000} id="Vector" stroke="var(--stroke-0, #111125)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.28571" />
            <path d={svgPaths.p11ee7080} id="Vector_2" stroke="var(--stroke-0, #111125)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.28571" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function LineRoundedArrowRigth4() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Line Rounded/Arrow rigth">
      <ArrowRigth4 />
    </div>
  );
}

function SubmitButton() {
  return (
    <div className="bg-[#c1a0fd] box-border content-stretch flex gap-[8px] h-full items-center justify-center px-[16px] py-[8px] relative rounded-br-[8px] rounded-tr-[8px] shrink-0" data-name="Submit Button">
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[1.2] not-italic relative shrink-0 text-[#111125] text-[14px] text-center text-nowrap tracking-[-0.28px] whitespace-pre">OK</p>
      <LineRoundedArrowRigth4 />
    </div>
  );
}

function EmailInput() {
  return (
    <div className="bg-[#f3ecff] box-border content-stretch flex h-[40px] items-center justify-between pl-[16px] pr-0 py-0 relative rounded-[8px] shrink-0 w-[333px]" data-name="Email Input">
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[1.5] not-italic opacity-80 relative shrink-0 text-[#828294] text-[12px] text-center text-nowrap tracking-[-0.24px] whitespace-pre">Entrer votre adresse email</p>
      <SubmitButton />
    </div>
  );
}

function TitleAndSubtitle() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Title and Subtitle">
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[1.5] min-w-full not-italic relative shrink-0 text-[#303044] text-[18px] tracking-[-0.54px] w-[min-content]">Recevoir notre Newletter</p>
      <EmailInput />
    </div>
  );
}

function NewsletterSignup() {
  return (
    <div className="bg-[#f8f9fb] box-border content-stretch flex flex-col gap-[40px] items-start px-[24px] py-[32px] relative rounded-[16px] shrink-0" data-name="Newsletter Signup">
      <TitleAndSubtitle />
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <FooterLinks />
      <NewsletterSignup />
    </div>
  );
}

function Logo1() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow h-[48px] items-start justify-center min-h-px min-w-px relative shrink-0" data-name="Logo">
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[1.2] not-italic relative shrink-0 text-[#c1a0fd] text-[37.333px] text-center text-nowrap tracking-[-0.7467px] whitespace-pre">WEEKOOK</p>
    </div>
  );
}

function Icon12() {
  return (
    <div className="relative shrink-0 size-[28px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
        <g id="Icon">
          <path d={svgPaths.p1df6d300} fill="var(--fill-0, #C1A0FD)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Icon13() {
  return (
    <div className="relative shrink-0 size-[28px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
        <g id="Icon">
          <path d={svgPaths.p290b9fc0} fill="var(--fill-0, #C1A0FD)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Icon14() {
  return (
    <div className="relative shrink-0 size-[28px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
        <g id="Icon">
          <path d={svgPaths.p38199200} fill="var(--fill-0, #C1A0FD)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Icon15() {
  return (
    <div className="relative shrink-0 size-[28px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
        <g id="Icon">
          <path d={svgPaths.p1e3b3b80} fill="var(--fill-0, #C1A0FD)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function SocialIcons() {
  return (
    <div className="basis-0 content-stretch flex gap-[16px] grow items-center justify-end min-h-px min-w-px relative shrink-0" data-name="Social Icons">
      <Icon12 />
      <Icon13 />
      <Icon14 />
      <Icon15 />
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Logo1 />
      <p className="basis-0 font-['Inter:Bold',sans-serif] font-bold grow leading-[1.5] min-h-px min-w-px not-italic relative shrink-0 text-[#828294] text-[12px] text-center tracking-[-0.24px]">© 2025 Weekook, Tous droits réservés.</p>
      <SocialIcons />
    </div>
  );
}

function FooterLight() {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-[40px] items-start left-0 overflow-clip px-[96px] py-[48px] top-[3621px] w-[1440px] border-t border-[#ece2fe]" data-name="Footer-Light">
      <Container6 />
      <div className="h-0 relative shrink-0 w-full" data-name="Footer Line">
        <div className="absolute bottom-0 left-0 right-0 top-[-1.5px]" style={{ "--stroke-0": "rgba(236, 226, 254, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1248 2">
            <line id="Footer Line" stroke="var(--stroke-0, #ECE2FE)" strokeWidth="1.5" x2="1248" y1="0.75" y2="0.75" />
          </svg>
        </div>
      </div>
      <Container7 />
    </div>
  );
}

export default function HomepagePublique() {
  return (
    <div className="bg-white relative size-full" data-name="HOMEPAGE PUBLIQUE">
      <NavbarLight />
      <div className="absolute bg-[#ece2fe] h-[442px] left-0 top-[80px] w-[1440px]" />
      <Group />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[1.3] left-[720.5px] not-italic text-[22px] text-black text-center text-nowrap top-[223px] translate-x-[-50%] whitespace-pre">
        {`Vous cherchez un passionné talentueux pour préparer une paella géante, `}
        <br aria-hidden="true" />
        un vrai mexicain natif pour vous enseigner l’art subtil des Tacos,
        <br aria-hidden="true" />
        ou encore un habitué de la cuisine Thaï dispo jeudi soir sur Marseille
      </p>
      <p className="absolute font-['Inter:Black',sans-serif] font-black leading-[1.3] left-[720.5px] not-italic text-[40px] text-black text-center text-nowrap top-[147px] translate-x-[-50%] whitespace-pre">WEEKOOK</p>
      <CardsLight />
      <PrimaryButton1 />
      <TestimonialsLight />
      <S4Inscrire />
      <FaqLight />
      <FooterLight />
    </div>
  );
}