// All wording shown in the app lives here, so clinicians can review and edit it
// without touching the screen logic in app.js.
//
// A pathway either has `steps` (one run through) or `topics` (the patient picks
// a topic, works through its steps, then can pick another).
//
// Step fields:
//   title     heading on screen
//   text      a short paragraph under the heading
//   prompts   questions for the clinician and patient to talk through
//   note      { key, label }  optional free-text box, written in the patient's words
//   choices   { key, label, options, multi }  tappable options
//   scale     { key, label, min, max, minLabel, maxLabel }  slider
//   links     [{ label, url }]  open in a new tab
//   widget    'breathing' | 'grounding'
//   carry     'goals' | 'questions'  shows what was noted earlier in the session
//   offer     { pathway, label }  button to jump to another pathway
//   info      { title, text }  a highlighted box of extra information
//   clinician text shown in a quiet box, worded so it is fine for the patient to see

window.CONTENT = {
  feelings: [
    { value: 1, face: "😣", label: "Not good at all" },
    { value: 2, face: "🙁", label: "Not great" },
    { value: 3, face: "😐", label: "OK" },
    { value: 4, face: "🙂", label: "Quite good" },
    { value: 5, face: "😊", label: "Really good" },
  ],

  durations: [10, 20, 30, 45],

  crisis: [
    { label: "Lincolnshire mental health crisis line", detail: "0303 123 4000, 24 hours a day, every day" },
    { label: "NHS 111", detail: "Choose option 2 for mental health" },
    { label: "Samaritans", detail: "Call 116 123, free, any time" },
    { label: "Shout", detail: "Text SHOUT to 85258" },
    { label: "Emergency", detail: "Call 999" },
  ],

  pathways: [
    {
      id: "open",
      tile: "Just talk, with a focus we agree",
      title: "Open discussion",
      icon: "💬",
      steps: [
        {
          title: "What's on your mind today?",
          text: "This is your time. Let's agree a few words to keep us focused.",
          note: { key: "focus", label: "Our focus today", pin: true },
        },
        {
          title: "Let's talk",
          text: "Take your time. The focus stays at the top of the screen.",
          talk: true,
        },
        {
          title: "Quick check",
          prompts: ["Are we still talking about what matters most to you?"],
          choices: {
            key: "still-on-focus",
            label: "",
            options: ["Yes, carry on", "Let's change the focus"],
          },
        },
        {
          title: "Before we finish",
          prompts: [
            "What's one thing you'll take away from today?",
            "Is there anything you'd like the team to know?",
          ],
          note: { key: "takeaway", label: "What I'll take away, and what I'd like the team to know" },
        },
      ],
    },

    {
      id: "assessment",
      tile: "Help the team understand me and what led to this admission",
      title: "Helping the team understand me",
      icon: "🧩",
      intro: "Pick one or two topics. There's no need to cover everything today.",
      topics: [
        {
          id: "happening",
          title: "What's been happening for me",
          steps: [
            {
              title: "What's been happening for me",
              prompts: [
                "What's been happening in the weeks before you came in?",
                "What do these experiences mean to you?",
                "Was there anything that could have helped sooner?",
              ],
              note: { key: "happening", label: "In my words" },
            },
          ],
        },
        {
          id: "helps",
          title: "What helps and what doesn't",
          steps: [
            {
              title: "What helps and what doesn't",
              prompts: [
                "What has helped in the past?",
                "What hasn't helped, or made things worse?",
                "How would you like support to be offered?",
                "How have you found your medication?",
              ],
              note: { key: "helps", label: "What helps me, and what doesn't" },
            },
          ],
        },
        {
          id: "strengths",
          title: "My strengths and how I cope",
          steps: [
            {
              title: "My strengths and how I cope",
              prompts: [
                "What are you good at, or proud of?",
                "What do you usually do when things get hard?",
                "What are you hoping for in the future?",
              ],
              note: { key: "strengths", label: "My strengths, coping and hopes" },
            },
          ],
        },
        {
          id: "daily",
          title: "My day-to-day life",
          steps: [
            {
              title: "My day-to-day life",
              prompts: [
                "What does a usual day look like for you?",
                "How have you been sleeping and eating?",
                "What do you enjoy doing?",
              ],
              note: { key: "daily", label: "My usual day, sleep, food and interests" },
            },
          ],
        },
        {
          id: "people",
          title: "People who matter to me",
          steps: [
            {
              title: "People who matter to me",
              prompts: [
                "Who is important to you?",
                "Who would you like to see or stay in touch with while you're here?",
                "Who would you like involved in your care, and what can we share with them?",
              ],
              note: { key: "people", label: "People who matter (first names or relationships only)" },
            },
          ],
        },
        {
          id: "worries",
          title: "Practical worries",
          steps: [
            {
              title: "Practical worries",
              prompts: ["Is anything at home worrying you right now?"],
              choices: {
                key: "worries",
                label: "Things on my mind",
                multi: true,
                options: [
                  "Housing",
                  "Money and bills",
                  "Work or study",
                  "Pets",
                  "People who depend on me",
                  "Something else",
                ],
              },
              note: { key: "worries-detail", label: "More about this" },
            },
          ],
        },
        {
          id: "identity",
          title: "Who I am",
          steps: [
            {
              title: "Who I am",
              prompts: [
                "Is there anything about your culture, faith, identity or how you communicate that we should know, so we can support you well here?",
                "Are there sights, sounds or things that help or upset you?",
                "Are there belongings you'd like with you?",
              ],
              note: { key: "identity", label: "What I'd like the team to know about me" },
            },
          ],
        },
        {
          id: "formulation",
          title: "Getting ready for my formulation meeting",
          steps: [
            {
              title: "Getting ready for my formulation meeting",
              text: "Soon after you arrive, the team meets with you to build a shared understanding and plan your care together.",
              prompts: [
                "What would you like the team to understand about you?",
                "What do you want to get out of being in hospital?",
                "What would need to be different for you to feel ready to leave?",
                "Who would you like to be there?",
              ],
              note: { key: "formulation", label: "What I want to say at my meeting" },
            },
          ],
        },
      ],
    },

    {
      id: "stabilisation",
      tile: "Learn ways to feel calmer and safer",
      title: "Feeling calmer and safer",
      icon: "🌿",
      intro:
        "These are the five areas from the Ash Villa Stabilisation Guide. Choose the one that feels most useful right now. If things feel very hard, Soothing or Grounding can be a good place to start.",
      introLink: {
        label: "Optional: introduction to trauma-informed approaches (CNWL)",
        url: "https://www.cnwl.nhs.uk/services/mental-health-services/cnwl-trauma-informed-approaches-tia",
      },
      topics: [
        {
          id: "soothing",
          title: "Soothing, safety and relaxation",
          steps: [
            {
              title: "Soothing, safety and relaxation",
              text: "This is about creating a sense of safety, being kind to yourself, and helping your mind and body to calm down.",
            },
            {
              title: "Let's try it together",
              text: "Follow the circle. Breathe in as it grows and out as it shrinks. Stop whenever you like.",
              widget: "breathing",
            },
            {
              title: "How was that?",
              prompts: ["How was that for you?", "When might this help you on the ward?"],
              note: { key: "soothing-reflect", label: "What I noticed" },
            },
            {
              title: "What I'll try before we next meet",
              workbooks: [
                "Workbook 1: Developing self-compassion",
                "Workbook 2: Sensory soothing",
                "Workbook 5: Breathing, relaxation and imagery",
              ],
              activities: "Colouring, drawing, listening to music, relaxation sessions, group activities, pet therapy",
              note: { key: "soothing-plan", label: "What I'll try" },
            },
          ],
        },
        {
          id: "lifeskills",
          title: "Life skills and attending to our basic needs",
          steps: [
            {
              title: "Life skills and basic needs",
              text: "This is about looking after the basics, like food, sleep and communicating what you need, and doing things that matter to you.",
              prompts: [
                "How are you sleeping and eating at the moment?",
                "Is there something you'd like to be able to ask for or say more easily?",
                "What's one thing that really matters to you?",
              ],
              note: { key: "lifeskills-reflect", label: "What I noticed" },
            },
            {
              title: "What I'll try before we next meet",
              workbooks: [
                "Workbook 4: Effective communication",
                "Workbook 6: Food and sleep",
                "Workbook 8: Values",
              ],
              activities: "Community leave, group activities, occupational therapy, nursing 1-1 sessions",
              note: { key: "lifeskills-plan", label: "What I'll try" },
            },
          ],
        },
        {
          id: "grounding",
          title: "Grounding, sensory work and connecting with our bodies",
          steps: [
            {
              title: "Grounding and connecting with our bodies",
              text: "This is about coming back to the present moment by noticing your surroundings and your body.",
            },
            {
              title: "Let's try it together",
              text: "Take your time with each one. You can say them out loud or in your head.",
              widget: "grounding",
            },
            {
              title: "How was that?",
              prompts: ["How was that for you?", "When might this help you on the ward?"],
              note: { key: "grounding-reflect", label: "What I noticed" },
            },
            {
              title: "What I'll try before we next meet",
              workbooks: ["Workbook 3: Mindfulness", "Workbook 9: Grounding"],
              activities:
                "Mindfulness group, community leave, walking group, music and sensory resources in the activity room, yoga",
              note: { key: "grounding-plan", label: "What I'll try" },
            },
          ],
        },
        {
          id: "distraction",
          title: "Distraction and distress tolerance",
          steps: [
            {
              title: "Distraction and distress tolerance",
              text: "This is about getting through very difficult moments by distracting yourself, riding out the feeling, or stepping back from difficult thoughts.",
              prompts: [
                "What has helped you get through a really hard moment before, even a little?",
                "What could you do in the next difficult moment on the ward?",
              ],
              note: { key: "distraction-reflect", label: "What I noticed" },
            },
            {
              title: "Let's try it together",
              text: "Breathing slowly can help a hard moment pass. Stop whenever you like.",
              widget: "breathing",
            },
            {
              title: "What I'll try before we next meet",
              workbooks: ["Workbook 7: Distraction and distancing", "Workbook 10: Maintaining my wellbeing"],
              activities: "Nursing 1-1 sessions, psychology",
              note: { key: "distraction-plan", label: "What I'll try" },
            },
          ],
        },
        {
          id: "creativity",
          title: "Creativity and spirituality",
          steps: [
            {
              title: "Creativity and spirituality",
              text: "This is about being creative and feeling connected to what you value, to other people, and to faith or spirituality if that matters to you.",
              prompts: [
                "What helps you feel connected, to yourself, to others, or to something bigger?",
                "Is there something creative you enjoy, or used to enjoy?",
              ],
              note: { key: "creativity-reflect", label: "What I noticed" },
            },
            {
              title: "What I'll try before we next meet",
              activities:
                "Activity room crafts, chaplaincy, community spiritual resources such as a local church, group activities, connecting with friends and family, Every Voice group, Ash Villa community meeting",
              note: { key: "creativity-plan", label: "What I'll try" },
            },
          ],
        },
      ],
    },

    {
      id: "proms",
      tile: "Set goals and check how I'm doing",
      title: "My goals and how I'm doing",
      icon: "🎯",
      intro: "Choose what you'd like to work on.",
      topics: [
        {
          id: "gbo",
          title: "Set or review my goals",
          steps: [
            {
              title: "What would you like to be different?",
              text: "If being here goes well, what would you like to be different? Try to put each goal in your own words.",
              goals: true,
            },
            {
              title: "One step up",
              prompts: [
                "For each goal, what would one step up the scale look like?",
                "If you've rated these before, what's helped you move, or what's got in the way?",
              ],
              note: { key: "gbo-steps", label: "My next steps" },
              offer: { pathway: "careplan", label: "Use these goals in my care plan" },
            },
          ],
        },
        {
          id: "reqol",
          title: "Talk about my ReQoL answers",
          steps: [
            {
              title: "Your ReQoL answers",
              text: "Have your ReQoL-10 from Rio to hand. We'll talk about your answers rather than fill it in again.",
              prompts: ["Which answers surprised you, or felt most important?"],
              note: { key: "reqol-important", label: "What stood out to me" },
            },
            {
              title: "What would you most like to be better?",
              choices: {
                key: "reqol-area",
                label: "Areas of my life",
                multi: true,
                options: [
                  "Doing everyday things",
                  "Hope",
                  "Trusting and feeling close to others",
                  "How I see myself",
                  "Feeling happy and enjoying things",
                  "Coping",
                  "My physical health",
                ],
              },
            },
            {
              title: "What might help?",
              prompts: ["What might help with that while you're here?", "Shall we add that to your care plan?"],
              note: { key: "reqol-help", label: "What might help" },
              offer: { pathway: "careplan", label: "Add this to my care plan" },
              softOffer: {
                pathway: "safety",
                text: "If things have felt very hard lately, we could make a safety plan together next.",
                label: "Make a safety plan together",
              },
            },
          ],
        },
      ],
      credit: "Goal based outcomes: Dr Duncan Law, CC BY-NC-SA 4.0.",
    },

    {
      id: "careplan",
      tile: "Work on my care plan",
      title: "My care plan",
      icon: "📝",
      steps: [
        {
          title: "What would you like your care plan to focus on?",
          carry: "goals",
          choices: {
            key: "care-area",
            label: "Areas",
            multi: true,
            options: [
              "My mental health and feeling safe",
              "Medication",
              "Physical health",
              "Daily life and activities",
              "People who matter to me",
              "Practical worries",
              "Leaving hospital",
            ],
          },
        },
        {
          title: "My needs",
          prompts: ["In your own words, what do you need help with?"],
          note: { key: "care-needs", label: "What I need help with" },
        },
        {
          title: "What will help",
          prompts: [
            "What can you do?",
            "What would you like staff to do?",
            "What would you like your family or friends to do?",
          ],
          note: { key: "care-help", label: "What will help, and who does what" },
        },
        {
          title: "How I'd like support to be given",
          prompts: ["Is there a way you'd prefer us to offer this, such as times of day, who, or how we talk to you?"],
          note: { key: "care-how", label: "How I'd like support" },
        },
        {
          title: "Leaving hospital",
          prompts: ["What would need to be in place for you to feel ready to go home?"],
          note: { key: "care-leaving", label: "What I need to be ready to leave" },
        },
        {
          title: "Does this sound like you?",
          text: "Here's what we've agreed, in your words. If something can't be agreed today, we'll explain why and come back to it.",
          review: true,
        },
      ],
    },

    {
      id: "wardround",
      tile: "Get ready for my ward round",
      title: "Preparing for my ward round",
      icon: "🗓️",
      text: "You can write your answers on your ward round sheet as we go, or copy them from the summary at the end.",
      steps: [
        {
          title: "Who would you like there?",
          prompts: ["Who would you like to attend, in person or on Teams?"],
          note: { key: "wr-attend", label: "Who I'd like there" },
          choices: { key: "wr-students", label: "Are you happy for students to attend?", options: ["Yes", "No", "Not sure"] },
        },
        {
          title: "What has gone well over the last week?",
          prompts: ["What's one thing that went better than you expected?"],
          note: { key: "wr-well", label: "What has gone well" },
        },
        {
          title: "What has been difficult or challenging?",
          prompts: ["What's been hardest this week?", "What would you like the team to know about it?"],
          note: { key: "wr-difficult", label: "What has been difficult" },
        },
        {
          title: "Medication",
          prompts: ["Have you noticed any side effects?", "Do you feel it's helping?", "Would you like more information about it?"],
          note: { key: "wr-meds", label: "About my medication" },
        },
        {
          title: "Leave",
          prompts: ["How has leave been going?", "Is there any leave you'd like to ask for?"],
          note: { key: "wr-leave", label: "About my leave" },
        },
        {
          title: "Physical health",
          prompts: [
            "Do you have any appointments, or any worries about your physical health?",
            "Would you like to borrow a smartwatch to help with activity?",
          ],
          note: { key: "wr-physical", label: "About my physical health" },
          choices: {
            key: "wr-help",
            label: "I need help with",
            multi: true,
            options: [
              "Smoking",
              "Weight loss",
              "Physical activity",
              "Managing stress",
              "Sleep",
              "Pain",
              "Alcohol or substances",
              "My blood sugar levels",
              "My cholesterol levels",
            ],
          },
        },
        {
          title: "Stabilisation work, activities and therapy",
          prompts: ["What's been helping?", "Is there anything you'd like more of?"],
          note: { key: "wr-activities", label: "What helps and what I need" },
        },
        {
          title: "Discharge and care plans",
          prompts: ["What do you need to support your recovery?", "What would you like to ask about going home?"],
          note: { key: "wr-discharge", label: "What I need for my recovery" },
        },
        {
          title: "The most important thing",
          carry: "questions",
          prompts: ["What's the most important thing you want to say or ask in the ward round?"],
          note: { key: "wr-main", label: "Most important to me" },
        },
      ],
    },

    {
      id: "diagnosis",
      tile: "Understand my diagnosis or experiences",
      title: "Understanding my diagnosis",
      icon: "📖",
      steps: [
        {
          title: "Your view first",
          text: "A diagnosis is one way of making sense of what you've been going through. We'll go at your pace.",
          prompts: [
            "What have you been told about your diagnosis, if anything?",
            "What does it mean to you?",
            "Is it a word you're comfortable with?",
          ],
          note: { key: "dx-view", label: "What it means to me" },
        },
        {
          title: "Find out more together",
          text: "Choose a site and look up the condition or experience together. It opens in a new tab, so you can come back here.",
          links: [
            {
              label: "Royal College of Psychiatrists: mental illnesses and mental health problems",
              url: "https://www.rcpsych.ac.uk/mental-health/mental-illnesses-and-mental-health-problems",
            },
            { label: "Mind: information and support", url: "https://www.mind.org.uk/information-support/" },
          ],
          prompts: ["Does this sound like you?", "What fits, and what doesn't?"],
          note: { key: "dx-fits", label: "What fits and what doesn't" },
        },
        {
          title: "Questions for the team",
          prompts: ["What would you like to ask your doctor or the team?"],
          note: { key: "dx-questions", label: "My questions" },
          offer: { pathway: "wardround", label: "Take these to my ward round" },
        },
      ],
    },

    {
      id: "wrap",
      tile: "Plan how I keep myself well",
      title: "My keeping well plan",
      icon: "🌱",
      intro: "Pick one part of your plan to work on today. If you already have a plan from a course or the Recovery College, it helps to have it with you.",
      introLink: {
        label: "Courses at the Lincolnshire Wellbeing and Recovery College",
        url: "https://www.lpft.nhs.uk/recovery-college",
      },
      topics: [
        {
          id: "well",
          title: "What I'm like when I'm well",
          steps: [{ title: "What I'm like when I'm well", prompts: ["How would someone who knows you describe you on a good day?"], note: { key: "kw-well", label: "When I'm well, I'm" } }],
        },
        {
          id: "toolbox",
          title: "My wellness toolbox",
          steps: [{ title: "My wellness toolbox", prompts: ["What things help you feel good or stay well?"], note: { key: "kw-toolbox", label: "Things that help me" } }],
        },
        {
          id: "daily",
          title: "My daily plan",
          steps: [{ title: "My daily plan", prompts: ["What do you need to do each day to stay well?"], note: { key: "kw-daily", label: "Every day I" } }],
        },
        {
          id: "upset",
          title: "Things that can upset me",
          steps: [
            {
              title: "Things that can upset me",
              prompts: ["What events or situations tend to knock you off balance?", "What could you do when they happen?"],
              note: { key: "kw-upset", label: "What upsets me, and what I can do" },
            },
          ],
        },
        {
          id: "signs",
          title: "Early warning signs",
          steps: [{ title: "Early warning signs", prompts: ["What small changes tell you things are starting to slip?"], note: { key: "kw-signs", label: "My early warning signs" } }],
        },
        {
          id: "worse",
          title: "When things are getting worse",
          steps: [
            {
              title: "When things are getting worse",
              prompts: ["How do you know things are getting much harder?", "What helps then?"],
              note: { key: "kw-worse", label: "When things are worse" },
            },
          ],
        },
        {
          id: "crisis",
          title: "My crisis plan",
          steps: [
            {
              title: "My crisis plan",
              prompts: ["Who do you want to help, and how?", "What would you like people to do, and not do?"],
              note: { key: "kw-crisis", label: "My crisis plan" },
            },
          ],
        },
      ],
    },

    {
      id: "community",
      tile: "Find support near home",
      title: "My recovery in the community",
      icon: "🏡",
      steps: [
        {
          title: "What would you like more of?",
          prompts: ["When you're back home, what would you like more of in your life?"],
          choices: {
            key: "hay-wants",
            label: "I'd like",
            multi: true,
            options: [
              "People to talk to",
              "Things to do",
              "To learn something new",
              "Volunteering or work",
              "Help with housing or money",
              "To keep active",
              "Support for my mental health",
            ],
          },
        },
        {
          title: "Search together",
          text: "How Are You Lincolnshire lists over 600 local groups, services and courses. Try searching for your area and what you chose, for example a Wellbeing Hub or Night Light Café.",
          links: [{ label: "How Are You Lincolnshire (H.A.Y)", url: "https://haylincolnshire.co.uk/" }],
          searchHints: "hay-wants",
        },
        {
          title: "Lincolnshire Wellbeing and Recovery College",
          text: "The Recovery College runs free courses about mental health and wellbeing, on topics like sleep, anxiety and keeping well. They are open to anyone aged 16 or over in Lincolnshire, with no referral needed, online on Teams or in person around the county.",
          links: [{ label: "Lincolnshire Wellbeing and Recovery College", url: "https://www.lpft.nhs.uk/recovery-college" }],
          info: {
            title: "How to book",
            text: "Register online, phone 01522 309333, or email lpft.recovery.college@nhs.net. Booking is essential, and you can bring someone with you if they book too.",
          },
          prompts: ["Is there a course that interests you?", "Would you like to try one while you're here, or after you go home?"],
          note: { key: "rc-courses", label: "Recovery College courses I'd like to try" },
        },
        {
          title: "Pick one or two",
          prompts: ["Which of these would you like to try?", "What might get in the way, and what would help?"],
          note: { key: "hay-picks", label: "What I'd like to try" },
        },
        {
          title: "Plan it",
          prompts: ["Could you try it on leave?", "Shall we add it to your discharge plan?"],
          note: { key: "hay-plan", label: "My plan" },
          offer: { pathway: "careplan", label: "Add this to my care plan" },
        },
      ],
    },

    {
      id: "safety",
      tile: "Make a plan for keeping safe when things get hard",
      title: "My safety plan",
      icon: "🛟",
      clinician:
        "For staff: this plan supports, and does not replace, your clinical judgement or risk assessment. If someone is at immediate risk, pause and follow ward procedures.",
      steps: [
        {
          title: "Getting through right now",
          text: "This plan is about what helps you get through difficult moments. We can go at your pace and skip anything.",
        },
        {
          title: "Reasons for living",
          prompts: ["What matters to you, or has kept you going before?", "What are you looking forward to, even something small?"],
          note: { key: "sp-reasons", label: "My reasons for living" },
        },
        {
          title: "Making my situation safer",
          prompts: ["Is there anything we could do together to make things safer for you, here and when you go home?"],
          note: { key: "sp-safer", label: "Making my situation safer" },
        },
        {
          title: "Things to lift or calm my mood",
          prompts: ["What helps you feel calmer or a little better, even for a short while?"],
          note: { key: "sp-calm", label: "Things to lift or calm my mood" },
        },
        {
          title: "Things to distract me",
          prompts: ["What can take your mind off things when they get hard?"],
          note: { key: "sp-distract", label: "Things to distract me" },
        },
        {
          title: "People to support me",
          prompts: ["Who could you spend time with, or get in touch with, when you're struggling?"],
          note: { key: "sp-people", label: "People to support me (first names only)" },
        },
        {
          title: "Who I can talk to if I'm distressed or thinking about self-harm or suicide",
          prompts: ["Who could you tell? This can include staff on the ward."],
          note: { key: "sp-talk", label: "Who I can talk to" },
        },
        {
          title: "Emergency professional support",
          crisis: true,
          links: [{ label: "Staying Safe: online safety plan", url: "https://stayingsafe.net/ST/" }],
        },
      ],
      credit: "Section headings from the Staying Safe safety plan, © 4 Mental Health 2024, stayingsafe.net.",
    },
  ],
};
