import type { BlogArticle } from '../types';

// Migrated existing
import { post as bestAgePreschool } from './best-age-to-start-preschool-in-rawalpindi';
import { post as benefitsMontessori } from './benefits-of-montessori-education';
import { post as prepareChildSchool } from './how-to-prepare-child-for-school';
import { post as playgroupActivities } from './playgroup-activities-for-kids-at-home';
import { post as saturdayCoaching } from './saturday-coaching-classes-rawalpindi';
import { post as eveningAcademy } from './evening-academy-after-school-rawalpindi';

// Cluster A: Brain Development
import { post as howMemoryDevelops } from './how-memory-develops-in-children';
import { post as earlyChildhoodBrain } from './early-childhood-brain-development-importance';
import { post as sensitivePeriods } from './sensitive-periods-child-development';
import { post as sleepAndLearning } from './sleep-and-learning-in-children';
import { post as brainFoods } from './brain-foods-pakistani-children';
import { post as screenTimeMemory } from './screen-time-child-memory-research';
import { post as readingAloud } from './how-reading-aloud-rewires-brain';
import { post as roleOfPlay } from './role-of-play-in-cognitive-development';
import { post as memoryGames } from './memory-games-for-preschoolers';
import { post as spotLearningDifficulties } from './spot-learning-difficulties-early';

// Cluster B: Health & Nutrition
import { post as healthyLunchBox } from './healthy-lunch-box-guide-pakistani-children';
import { post as vitaminDeficiencies } from './vitamin-deficiencies-pakistani-children';
import { post as howMuchSleep } from './how-much-sleep-children-need';
import { post as buildingImmunity } from './building-immunity-in-children-naturally';
import { post as hydrationKids } from './hydration-for-children-rawalpindi';
import { post as outdoorPlay } from './outdoor-play-physical-health-rawalpindi';
import { post as pickyEating } from './picky-eating-and-food-sensitivities';
import { post as vaccinationSchedule } from './childhood-vaccination-schedule-pakistan';
import { post as hygieneHabits } from './hygiene-habits-for-children';
import { post as obesityPrevention } from './childhood-obesity-prevention-pakistani-families';

// Cluster C: Studies & Reading
import { post as dailyReadingHabit } from './build-daily-reading-habit-child';
import { post as homeworkHelp } from './helping-with-homework-without-doing-it';
import { post as studyRoutines } from './effective-study-routines-primary-school';
import { post as mathStruggle } from './why-child-struggles-with-math';
import { post as englishVsUrduMedium } from './english-medium-vs-urdu-medium-schools';
import { post as bilingualVocabulary } from './building-vocabulary-bilingual-pakistani-home';
import { post as examStress } from './handling-exam-stress-primary-school';
import { post as roteLearningCost } from './hidden-cost-of-rote-learning';
import { post as concentrationTechniques } from './concentration-techniques-restless-learners';
import { post as whenStartAcademics } from './when-to-start-formal-academics';

// Cluster D: Montessori
import { post as whatIsMontessori } from './what-is-montessori-education-really';
import { post as montessoriVsTraditional } from './montessori-vs-traditional-schooling';
import { post as preparedEnvironment } from './montessori-prepared-environment-explained';
import { post as montessoriTeacher } from './role-of-montessori-teacher';
import { post as mixedAgeClassrooms } from './why-mixed-age-classrooms-work';
import { post as montessoriHome } from './montessori-at-home-realistic';
import { post as montessoriMyths } from './common-myths-about-montessori';
import { post as montessoriTransition } from './montessori-transition-to-class-1';

// Cluster E: Parenting
import { post as managingTantrums } from './managing-tantrums-without-losing-patience';
import { post as positiveDiscipline } from './positive-discipline-that-actually-works';
import { post as siblingRivalry } from './sibling-rivalry-pakistani-households';
import { post as separationAnxiety } from './separation-anxiety-calm-guide';
import { post as reducingScreenTime } from './reducing-screen-time-without-battles';
import { post as buildingIndependence } from './building-independence-in-young-children';
import { post as howToPraise } from './how-to-praise-children';
import { post as bigEmotions } from './talking-to-children-about-big-emotions';

// Cluster F: Early Years
import { post as readyForPreschool } from './signs-child-is-ready-for-preschool';
import { post as choosingPreschool } from './choosing-preschool-in-rawalpindi';
import { post as languageMilestones } from './language-development-milestones-2-to-6';
import { post as socialSkillsSchool } from './social-skills-before-school';
import { post as toiletTraining } from './toilet-training-no-pressure-approach';
import { post as shyChildren } from './helping-shy-children-open-up';
import { post as firstWeekSchool } from './first-week-of-school-what-happens';

const allPosts: BlogArticle[] = [
  bestAgePreschool,
  benefitsMontessori,
  prepareChildSchool,
  playgroupActivities,
  saturdayCoaching,
  eveningAcademy,
  howMemoryDevelops,
  earlyChildhoodBrain,
  sensitivePeriods,
  sleepAndLearning,
  brainFoods,
  screenTimeMemory,
  readingAloud,
  roleOfPlay,
  memoryGames,
  spotLearningDifficulties,
  healthyLunchBox,
  vitaminDeficiencies,
  howMuchSleep,
  buildingImmunity,
  hydrationKids,
  outdoorPlay,
  pickyEating,
  vaccinationSchedule,
  hygieneHabits,
  obesityPrevention,
  dailyReadingHabit,
  homeworkHelp,
  studyRoutines,
  mathStruggle,
  englishVsUrduMedium,
  bilingualVocabulary,
  examStress,
  roteLearningCost,
  concentrationTechniques,
  whenStartAcademics,
  whatIsMontessori,
  montessoriVsTraditional,
  preparedEnvironment,
  montessoriTeacher,
  mixedAgeClassrooms,
  montessoriHome,
  montessoriMyths,
  montessoriTransition,
  managingTantrums,
  positiveDiscipline,
  siblingRivalry,
  separationAnxiety,
  reducingScreenTime,
  buildingIndependence,
  howToPraise,
  bigEmotions,
  readyForPreschool,
  choosingPreschool,
  languageMilestones,
  socialSkillsSchool,
  toiletTraining,
  shyChildren,
  firstWeekSchool,
];

export const blogArticles: BlogArticle[] = [...allPosts].sort((a, b) =>
  b.publishedDate.localeCompare(a.publishedDate),
);

export type { BlogArticle };
