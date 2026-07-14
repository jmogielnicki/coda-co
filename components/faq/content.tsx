import type { FaqCategory } from "@/components/faq/FaqBrowser";

// Sensitive, editorial guidance content — surfaced on /guidance.
export const guidanceCategories: FaqCategory[] = [
  {
    heading: "When someone dies",
    faqs: [
      {
        id: "first-things-when-someone-dies",
        q: "What are the first things I need to do when someone dies?",
        a: (
          <div className="space-y-3">
            <p>
              The very first thing to do when someone dies is to take time to
              breathe. You have time to sit. You have time to call another loved
              one. There is no emergency now.
            </p>
            <p>
              There is a lot to take care of when someone dies, but you are
              allowed to grieve. You are allowed to be confused, and
              overwhelmed, and a mess.
            </p>
            <p>
              Grief has no timeline and affects each of us differently. There is
              no one way to grieve, just as there is no one way to love someone.
            </p>
            <p>
              After someone dies, their life must be legally and
              administratively closed out. The many, many tasks that need to be
              done when someone dies are together stressful, bureaucratic work.
              These tasks can take months to years to complete, often while
              complicated by grief. The most important thing to remember is that
              when someone has died, it is not an immediate emergency.
            </p>
            <p>
              Some things need to take place in the first 24 hours after death,
              but nothing needs to happen in the first few minutes. When
              you&apos;re ready, read on for more details.
            </p>
          </div>
        ),
        searchText:
          "What are the first things I need to do when someone dies? The very first thing to do when someone dies is to take time to breathe. You have time to sit and to call another loved one. There is no emergency now. There is a lot to take care of, but you are allowed to grieve, to be confused, overwhelmed, and a mess. Grief has no timeline and affects each of us differently. After someone dies, their life must be legally and administratively closed out, and these stressful, bureaucratic tasks can take months to years to complete, often complicated by grief. When someone has died it is not an immediate emergency. Some things need to take place in the first 24 hours after death, but nothing needs to happen in the first few minutes.",
      },
    ],
  },
  {
    heading: "Funerals & body disposition",
    faqs: [
      {
        q: "What choices do I have for body disposition (e.g. burial, cremation, natural burial)?",
        a: (
          <div className="space-y-3">
            <p>
              There are many ways to lay a body to rest. Here is a brief
              explanation about the most common types of body disposition:
            </p>
            <p>
              <span className="font-medium text-ch">
                Green Burial (also called Natural Burial):
              </span>{" "}
              This is a popular alternative to &lsquo;traditional burial.&rsquo;
              In a green burial, a body is placed in its natural state (no
              embalming) into a biodegradable casket or natural fiber shroud.
              The body is then placed directly into the earth, allowing it to
              decompose naturally. Green burials are legal in all 50 US states,
              though there are some regulations around where they can take
              place. Many states have green burial cemeteries or &lsquo;hybrid&rsquo;
              cemeteries which offer both traditional and green burials.
            </p>
            <p>
              <span className="font-medium text-ch">Traditional Burial:</span>{" "}
              A traditional burial may include embalming (where blood is drained
              from a body and replaced with formaldehyde or other chemicals for
              preservation), a casket (wooden, metal, other) and a grave is
              generally lined with concrete (forming the burial vault) before
              the body is laid to rest. Temporarily delays decomposition,
              keeping the body intact for several days or up to a week.
            </p>
            <p>
              <span className="font-medium text-ch">Burial at Sea:</span> A
              loved one&apos;s body or their cremated remains can be buried at
              sea. This form of burial is regulated by the Environmental
              Protection Agency and must take place at least three nautical
              miles from shore. There are several rules around body and casket
              preparation for burial at sea, and the EPA must be notified of a
              burial within 30 days following the event. More information about
              burial at sea is available at the{" "}
              <a
                href="https://www.epa.gov/ocean-dumping/burial-sea"
                target="_blank"
                rel="noopener noreferrer"
                className="text-tr hover:underline"
              >
                EPA website
              </a>
              .
            </p>
            <p>
              <span className="font-medium text-ch">Traditional Cremation:</span>{" "}
              In traditional cremation, a body is incinerated (burned) and the
              remaining bone fragments are crushed into ashes. Ashes can then be
              returned to loved ones to be buried, kept in an urn, and/or
              scattered in a beloved location.
            </p>
            <p>
              <span className="font-medium text-ch">
                Natural Organic Reduction (also called Terramation):
              </span>{" "}
              Terramation is a process that allows for natural decomposition in
              urban areas, where green cemeteries and natural burial may not be
              readily available. In this process, bodies are laid to rest within
              a closed vessel along with organic material (such as straw,
              alfalfa and wood chips) to transform into nutrient-rich soil over
              several weeks. The soil can then be returned to loved ones to be
              used in plantings or to regenerate conservation areas.
            </p>
            <p>
              <span className="font-medium text-ch">
                Aquamation (also called Water Cremation):
              </span>{" "}
              Aquamation is a process that uses water and an alkaline solution
              to break down a body. This process leaves only bone fragments. As
              in fire cremation, these fragments can then be crushed into ashes
              and returned to a loved one.
            </p>
            <p>
              <span className="font-medium text-ch">Anatomical donation:</span>{" "}
              Some people choose (before death) to donate their body to science.
              Bodies may go to universities, medical schools, or research
              organizations for scientific study and medical training. Most
              programs will cover the costs of transportation, cremation after
              study, and the return of ashes to the family.
            </p>
          </div>
        ),
        searchText:
          "There are many ways to lay a body to rest. Green Burial Natural Burial is a popular alternative to traditional burial. In a green burial, a body is placed in its natural state (no embalming) into a biodegradable casket or natural fiber shroud. The body is then placed directly into the earth, allowing it to decompose naturally. Green burials are legal in all 50 US states. Many states have green burial cemeteries or hybrid cemeteries. Traditional Burial may include embalming, a casket, and a concrete-lined grave forming the burial vault. Burial at Sea: a body or cremated remains can be buried at sea, regulated by the Environmental Protection Agency at least three nautical miles from shore, EPA notified within 30 days. Traditional Cremation: a body is incinerated and bone fragments crushed into ashes, buried, kept in an urn, or scattered. Natural Organic Reduction Terramation allows natural decomposition in urban areas, bodies laid in a closed vessel with straw alfalfa wood chips to transform into nutrient-rich soil. Aquamation Water Cremation uses water and an alkaline solution to break down a body, leaving bone fragments crushed into ashes. Anatomical donation: donate your body to science, universities, medical schools, or research organizations.",
      },
      {
        q: "What are the rules around funerals where I live?",
        a: (
          <div className="space-y-3">
            <p>
              While laws around the transport and disposition of human bodies
              varies by state, there is a federal Funeral Rule in place to
              protect the consumer who is planning and paying for a funeral.
              These rules exist to protect people from unfair upselling and
              unclear pricing structures at a funeral home and are enforced by
              the Federal Trade Commission. The Funeral Rule makes it possible
              for you to choose only the goods and services from a funeral home
              that you want or need. The rule allows you to compare prices
              between funeral homes and makes it possible to select arrangements
              you want to use for a home funeral. In short, you do not have to
              buy a package, and you do not have to use a funeral home if you
              prefer a home funeral.
            </p>
            <p>The US Funeral Rule gives you the right to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="font-medium text-ch">
                  Buy only the funeral arrangements you want.
                </span>{" "}
                You have a protected right to buy separate goods (such as
                caskets) and services (such as embalming or a memorial service).
                You do not have to accept a package that includes any items you
                do not want.
              </li>
              <li>
                <span className="font-medium text-ch">
                  Hear price information over the telephone.
                </span>{" "}
                Funeral directors are required to give you pricing information
                over the telephone if you ask for it, and you do not need to
                give them your name, telephone number or address first. Some
                funeral homes will mail their price lists, and some post them
                online.
              </li>
              <li>
                <span className="font-medium text-ch">
                  Receive a written, itemized price list when you visit a
                  funeral home.
                </span>{" "}
                The funeral home must give you a General Price List that is yours
                to keep. It lists all the items and services the home offers, and
                the cost of each one.
              </li>
              <li>
                <span className="font-medium text-ch">
                  See a written casket price list before you see the actual
                  caskets.
                </span>{" "}
                It can be overwhelming to shop for a casket. Funerals must
                provide you a written casket price list if you ask, and this is a
                great place to start &ndash; you can see this list before you see
                the caskets. You can also ask about lower-priced caskets that are
                listed but may not be on display.
              </li>
              <li>
                <span className="font-medium text-ch">
                  Get a price list for outer burial containers.
                </span>{" "}
                Outer burial containers, such as concrete vaults lining a grave,
                are not required by state law anywhere in the U.S., but many
                cemeteries require them to prevent the grave from caving in
                during a funeral or after the ground settles. If the funeral home
                sells containers, but doesn&apos;t list their prices on the
                general price list, you have the right to look at a separate
                container price list before you see the containers. If you
                don&apos;t see the lower-priced containers listed, ask about
                them.
              </li>
              <li>
                <span className="font-medium text-ch">
                  Receive a written statement after you decide what you want, and
                  before you pay.
                </span>{" "}
                This statement should show exactly what you are buying and the
                cost of each individual item. The funeral home is required to
                give you this once you have made your selection and before paying
                for items.
              </li>
              <li>
                <span className="font-medium text-ch">
                  If you choose cremation for your loved one, you do not need to
                  buy a casket.
                </span>{" "}
                You may use an alternative container. No state or local law
                requires the use of a casket for cremation. If a funeral home
                offers cremation, it must also tell you that alternative
                containers are available. They may be out of unfinished wood,
                fiberboard or cardboard.
              </li>
              <li>
                <span className="font-medium text-ch">
                  You may provide the funeral home with a casket or urn you buy
                  elsewhere.
                </span>{" "}
                The funeral provider cannot refuse to handle a casket or urn you
                bought somewhere else, or charge you a fee to use it. You may
                order a casket or urn to be delivered to the funeral home and the
                home cannot require you to be there when the casket or urn is
                delivered to them.
              </li>
              <li>
                <span className="font-medium text-ch">
                  Embalming is never required.
                </span>{" "}
                No state law requires embalming for every death. Some states
                require embalming or refrigeration if the body is not buried or
                cremated within a certain time; some states don&apos;t require it
                at all. In most cases, refrigeration or other cooling is an
                acceptable alternative. In addition, you may choose services like
                direct cremation and immediate burial, which don&apos;t require
                any form of preservation. Many funeral homes have a policy
                requiring embalming if the body is to be publicly viewed, but
                this is not required by law in most states. Ask if the funeral
                home offers private family viewing without embalming. If some
                form of preservation is a practical necessity, ask the funeral
                home if refrigeration is available.
              </li>
            </ul>
            <p className="text-cl">
              Source:{" "}
              <a
                href="https://consumer.ftc.gov/articles/ftc-funeral-rule"
                target="_blank"
                rel="noopener noreferrer"
                className="text-tr hover:underline"
              >
                Federal Trade Commission Advice: The Funeral Rule
              </a>
            </p>
          </div>
        ),
        searchText:
          "What are the rules around funerals where I live? Laws around transport and disposition of human bodies vary by state, but there is a federal Funeral Rule enforced by the Federal Trade Commission to protect consumers from unfair upselling and unclear pricing at a funeral home. You do not have to buy a package or use a funeral home if you prefer a home funeral. The US Funeral Rule gives you the right to: buy only the funeral arrangements you want; hear price information over the telephone; receive a written itemized General Price List when you visit a funeral home; see a written casket price list before you see the actual caskets; get a price list for outer burial containers and concrete vaults; receive a written statement before you pay; choose cremation without buying a casket and use an alternative container of unfinished wood, fiberboard or cardboard; provide the funeral home with a casket or urn you buy elsewhere without a fee. Embalming is never required; refrigeration is often an acceptable alternative; direct cremation and immediate burial require no preservation. Source: Federal Trade Commission Advice The Funeral Rule.",
      },
    ],
  },
  {
    heading: "Death doulas (end-of-life doulas)",
    faqs: [
      {
        q: "What is a death doula (also called an end of life doula)?",
        a: (
          <div className="space-y-3">
            <p>
              A death doula, also known as an end-of-life doula, is a
              professional companion who offers holistic, non-medical support to
              a dying person and their loved ones. Doulas provide emotional,
              spiritual and practical support to empower dignity and
              self-determination throughout the end of life and dying process.
              Death doulas can begin working with someone when death is very
              near, or earlier, when death is simply somewhere on the horizon.
            </p>
            <p>End of life doulas can provide a range of services including:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Speak openly about dying and planning for death</li>
              <li>
                Discuss and record end-of-life care planning, including advance
                directives
              </li>
              <li>
                Develop a plan for death, including wishes for location, sounds,
                aromas
              </li>
              <li>Assist with physical and practical care</li>
              <li>
                Show examples of how to care for, touch and speak to a dying
                person
              </li>
              <li>Provide respite for caregivers</li>
              <li>Explain the signs and symptoms of the dying process</li>
              <li>Assist with legacy projects and pre-death organization</li>
              <li>
                Provide spiritual support to dying individuals and loved ones
              </li>
              <li>Assist with care and cleaning of a body following death</li>
              <li>Guide people through the early stages of grieving</li>
            </ul>
          </div>
        ),
        searchText:
          "What is a death doula, also called an end of life doula? A death doula is a professional companion who offers holistic, non-medical support to a dying person and their loved ones, providing emotional, spiritual and practical support to empower dignity and self-determination throughout the end of life and dying process. Death doulas can begin working with someone when death is very near or earlier. End of life doulas can: speak openly about dying and planning for death; discuss and record end-of-life care planning including advance directives; develop a plan for death including location, sounds, aromas; assist with physical and practical care; show how to care for, touch and speak to a dying person; provide respite for caregivers; explain the signs and symptoms of the dying process; assist with legacy projects and pre-death organization; provide spiritual support; assist with care and cleaning of a body following death; and guide people through the early stages of grieving.",
      },
      {
        q: "What are some real life examples of death doula work?",
        a: (
          <div className="space-y-3">
            <ul className="list-disc pl-5 space-y-3">
              <li>
                A death doula is sitting at the kitchen table with a woman just
                after her husband has died at home. The hospice team visited
                yesterday but he died today with just his wife and the death
                doula at home. Now the doula is holding her hand, helping her
                take the small steps around what has to happen next; phone calls
                and such. The doula is also holding space for the woman to feel
                overwhelmed and in complete disbelief that her husband of 41
                years has just died.
              </li>
              <li>
                A brother and sister are planning a home funeral for their
                mother, who died at the hospital yesterday. Their death doula is
                helping to transform their living room into a space for vigil and
                memories, with dried flowers, fresh flowers, their mother&apos;s
                favorite handmade quilts and photographs. The doula is helping
                them prepare a space at one end of the living room for the pine
                casket that their uncle made for her, and will help them
                understand how to keep her body cooled once she is home in
                preparation for her funeral the following day.
              </li>
              <li>
                A death doula is working with a gentleman in his 90s. He hopes to
                leave certain items to his children and also write down a series
                of stories from his youth to be passed on to his children and
                grandchildren when he dies. His doula visits twice a week, each
                for three hours at a time. Together they gently go through his
                belongings, wrapping items he hopes to gift, and writing out
                cards for each. Items with no intended receiver are placed into a
                pile for donation, which the doula transports every month or so
                to the gentleman&apos;s favorite second hand shop. His doula also
                transcribes stories for him into a single file, and will have the
                file printed and bound for him when he decides it is ready. They
                enjoy reading over his stories after he has told them and editing
                together.
              </li>
            </ul>
          </div>
        ),
        searchText:
          "What are some real life examples of death doula work? A death doula sitting at the kitchen table with a woman just after her husband died at home, holding her hand and helping with the next steps and phone calls. A brother and sister planning a home funeral for their mother, transforming the living room into a vigil space with dried and fresh flowers, handmade quilts and photographs and a pine casket their uncle made, and learning how to keep her body cooled. A death doula helping a gentleman in his 90s give away belongings, wrap and label gifts for his children and grandchildren, and transcribe and bind his life stories.",
      },
      {
        q: "How much do death doulas cost?",
        a: (
          <div className="space-y-3">
            <p>
              Costs for a death doula will vary significantly based on location
              and services provided. An hourly rate might range from $50 to $180
              per hour. Some doulas may offer packaged services, such as full
              support through and until a client&apos;s death. Others may charge
              a flat fee for 24-hour bedside vigils or for multiple days at the
              bedside when the end of life is near. Some doulas offer a sliding
              scale or pro bono (no cost) services to individuals in financial
              hardship.
            </p>
            <p>
              Doula services are not currently covered by Medicare, Medicaid or
              private insurance in the US since they do not provide medical care.
              As such, doula services typically are paid directly by the client
              or their loved ones.
            </p>
            <p>
              Some hospice programs integrate death doula services into their
              selection of offerings, at no extra cost. Additionally, some long
              term care insurance policies may reimburse part of the cost of a
              death doula&apos;s services, so it is worth inquiring if an
              individual holds one of these policies.
            </p>
          </div>
        ),
        searchText:
          "How much do death doulas cost? Costs vary significantly based on location and services provided. An hourly rate might range from $50 to $180 per hour. Some doulas offer packaged services such as full support through a client's death, flat fees for 24-hour bedside vigils or multiple days at the bedside, and some offer a sliding scale or pro bono services for financial hardship. Doula services are not currently covered by Medicare, Medicaid or private insurance since they do not provide medical care, so they are typically paid directly by the client or their loved ones. Some hospice programs integrate death doula services at no extra cost, and some long term care insurance policies may reimburse part of the cost.",
      },
      {
        q: "Is hiring a death doula worth it?",
        a: "While the US medical system tends to focus on treating disease, death doula practice focuses on tending to the whole human being in their final months and moments. Doula work is rooted in ancient community care traditions. Doulas can offer a listening ear, continuity of presence, gentle guidance, physical and spiritual comfort, and a sense of dignity to a dying person. Many families find working with a doula deeply healing when a loved one passes, and find that a death doula has helped them approach death with grace rather than fear.",
      },
    ],
  },
];

// Functional, transactional help — surfaced on /faq (the Help Center).
export const helpCenterCategories: FaqCategory[] = [
  {
    heading: "Getting started",
    faqs: [
      {
        q: "What is CodaCo?",
        a: "CodaCo is a curated marketplace for death and dying. We bring together thoughtfully vetted goods — urns, ash jewelry, burial shrouds, planning workbooks, memorial art — alongside local services like death doulas, estate attorneys, celebrants, and death cleaners, so you can find what you need in one calm place.",
      },
      {
        q: "Do I need an account to browse?",
        a: "No. You can browse goods, services, and resources freely without an account. You'll only be asked to sign in when you want to save a cart, contact a vendor, or place an order.",
      },
    ],
  },
  {
    heading: "Buying goods",
    faqs: [
      {
        q: "How do I buy something?",
        a: "Add items to your cart from any product page, then check out when you're ready. Each listing shows available options — size, material, engraving — and shipping or local-pickup details before you commit.",
      },
      {
        q: "Are the makers and products vetted?",
        a: "Yes. Every vendor on CodaCo is reviewed before they can list, and we curate for quality, care, and relevance to death and dying. Verified reviews from real buyers help you judge each maker for yourself.",
      },
      {
        q: "What are your shipping and return policies?",
        a: "Shipping options and timelines are set by each maker and shown on the product page. Because many items are handmade or personalized, return policies vary by vendor — check the listing, and reach out to the maker directly with any questions before ordering.",
      },
    ],
  },
  {
    heading: "Booking services",
    faqs: [
      {
        q: "How do I find a service provider near me?",
        a: "On the services pages you can search by your zip code and filter by the type of help you need — death doula, estate attorney, celebrant, end-of-life organizer, and more. Providers who serve your area (or work virtually) will appear with their location and distance.",
      },
      {
        q: "What's a death doula, and is that where I should start?",
        a: "A death doula offers non-medical emotional, practical, and spiritual support to a dying person and their loved ones. They're often a good first call because they can help you understand what else you might need and who to contact next.",
      },
      {
        q: "How do I contact a provider?",
        a: "Each provider has a public profile with a contact option. Sign in, send a message describing your situation, and the provider will follow up directly to discuss availability, approach, and fees.",
      },
    ],
  },
  {
    heading: "Trust & safety",
    faqs: [
      {
        q: "How are vendors and providers vetted?",
        a: "Every listing is reviewed before it goes live, typically within one to two business days. Service providers may be asked for credentials or verification documents — certified doulas, licensed attorneys, and the like — so you can engage with confidence.",
      },
      {
        q: "Is my information private?",
        a: "Privacy is a default, not an add-on. Your searches are never stored or sold, and we don't share your information with third parties. You decide when to reach out to a vendor or provider.",
      },
      {
        q: "Can I trust the reviews?",
        a: "Reviews on CodaCo come from verified clients and buyers who have actually worked with a vendor or purchased an item. They're there to help you make a grounded decision.",
      },
    ],
  },
  {
    heading: "Selling on CodaCo",
    faqs: [
      {
        q: "Can I list my own goods or services?",
        a: "Yes — makers, artists, and practitioners are welcome. Our List with us page explains how to create a profile, what we look for, and how approval works.",
      },
      {
        q: "Is there a fee to list?",
        a: "Plans start free with up to three listings. Paid plans add unlimited listings and featured placement, and a small transaction fee applies on goods sales. Full details are on the List with us page.",
      },
    ],
  },
];
