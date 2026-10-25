/// <reference types="vite/client" />
import { raw, type Raw } from "./html";
// Lucide icons bundled at build time (only the ones listed here ship to the browser).

import house from 'lucide-static/icons/house.svg?raw';
import calendar from 'lucide-static/icons/calendar.svg?raw';
import calendarDays from 'lucide-static/icons/calendar-days.svg?raw';
import messageSquare from 'lucide-static/icons/message-square.svg?raw';
import ellipsis from 'lucide-static/icons/ellipsis.svg?raw';
import plus from 'lucide-static/icons/plus.svg?raw';
import bell from 'lucide-static/icons/bell.svg?raw';
import search from 'lucide-static/icons/search.svg?raw';
import phone from 'lucide-static/icons/phone.svg?raw';
import copy from 'lucide-static/icons/copy.svg?raw';
import share2 from 'lucide-static/icons/share-2.svg?raw';
import check from 'lucide-static/icons/check.svg?raw';
import circleCheck from 'lucide-static/icons/circle-check.svg?raw';
import x from 'lucide-static/icons/x.svg?raw';
import chevronRight from 'lucide-static/icons/chevron-right.svg?raw';
import chevronDown from 'lucide-static/icons/chevron-down.svg?raw';
import chevronLeft from 'lucide-static/icons/chevron-left.svg?raw';
import arrowLeft from 'lucide-static/icons/arrow-left.svg?raw';
import arrowRight from 'lucide-static/icons/arrow-right.svg?raw';
import clock from 'lucide-static/icons/clock.svg?raw';
import user from 'lucide-static/icons/user.svg?raw';
import users from 'lucide-static/icons/users.svg?raw';
import mail from 'lucide-static/icons/mail.svg?raw';
import lock from 'lucide-static/icons/lock.svg?raw';
import eye from 'lucide-static/icons/eye.svg?raw';
import eyeOff from 'lucide-static/icons/eye-off.svg?raw';
import shieldCheck from 'lucide-static/icons/shield-check.svg?raw';
import zap from 'lucide-static/icons/zap.svg?raw';
import creditCard from 'lucide-static/icons/credit-card.svg?raw';
import receipt from 'lucide-static/icons/receipt.svg?raw';
import banknote from 'lucide-static/icons/banknote.svg?raw';
import settings from 'lucide-static/icons/settings.svg?raw';
import scissors from 'lucide-static/icons/scissors.svg?raw';
import building2 from 'lucide-static/icons/building-2.svg?raw';
import truck from 'lucide-static/icons/truck.svg?raw';
import shoppingBag from 'lucide-static/icons/shopping-bag.svg?raw';
import sparkles from 'lucide-static/icons/sparkles.svg?raw';
import stethoscope from 'lucide-static/icons/stethoscope.svg?raw';
import triangleAlert from 'lucide-static/icons/triangle-alert.svg?raw';
import send from 'lucide-static/icons/send.svg?raw';
import ellipsisVertical from 'lucide-static/icons/ellipsis-vertical.svg?raw';
import logOut from 'lucide-static/icons/log-out.svg?raw';
import history from 'lucide-static/icons/history.svg?raw';
import activity from 'lucide-static/icons/activity.svg?raw';
import cpu from 'lucide-static/icons/cpu.svg?raw';
import radio from 'lucide-static/icons/radio.svg?raw';
import thermometer from 'lucide-static/icons/thermometer.svg?raw';
import fileText from 'lucide-static/icons/file-text.svg?raw';
import globe from 'lucide-static/icons/globe.svg?raw';
import link from 'lucide-static/icons/link.svg?raw';
import refreshCw from 'lucide-static/icons/refresh-cw.svg?raw';
import circleAlert from 'lucide-static/icons/circle-alert.svg?raw';
import checkCheck from 'lucide-static/icons/check-check.svg?raw';
import badgeCheck from 'lucide-static/icons/badge-check.svg?raw';
import trash2 from 'lucide-static/icons/trash-2.svg?raw';
import pencil from 'lucide-static/icons/pencil.svg?raw';
import store from 'lucide-static/icons/store.svg?raw';
import rotateCcw from 'lucide-static/icons/rotate-ccw.svg?raw';
import bot from 'lucide-static/icons/bot.svg?raw';
import messageCircle from 'lucide-static/icons/message-circle.svg?raw';
import logIn from 'lucide-static/icons/log-in.svg?raw';
import wallet from 'lucide-static/icons/wallet.svg?raw';
import listChecks from 'lucide-static/icons/list-checks.svg?raw';
import slidersHorizontal from 'lucide-static/icons/sliders-horizontal.svg?raw';
import externalLink from 'lucide-static/icons/external-link.svg?raw';
import info from 'lucide-static/icons/info.svg?raw';
import menu from 'lucide-static/icons/menu.svg?raw';
import mapPin from 'lucide-static/icons/map-pin.svg?raw';
import database from 'lucide-static/icons/database.svg?raw';
import workflow from 'lucide-static/icons/workflow.svg?raw';
import layers from 'lucide-static/icons/layers.svg?raw';
import server from 'lucide-static/icons/server.svg?raw';
import keyRound from 'lucide-static/icons/key-round.svg?raw';
import fingerprint from 'lucide-static/icons/fingerprint.svg?raw';
import scale from 'lucide-static/icons/scale.svg?raw';
import rocket from 'lucide-static/icons/rocket.svg?raw';
import package from 'lucide-static/icons/package.svg?raw';
import idCard from 'lucide-static/icons/id-card.svg?raw';
import calendarCheck from 'lucide-static/icons/calendar-check.svg?raw';

const ICONS: Record<string, string> = {
  'house': house,
  'calendar': calendar,
  'calendar-days': calendarDays,
  'message-square': messageSquare,
  'ellipsis': ellipsis,
  'plus': plus,
  'bell': bell,
  'search': search,
  'phone': phone,
  'copy': copy,
  'share-2': share2,
  'check': check,
  'circle-check': circleCheck,
  'x': x,
  'chevron-right': chevronRight,
  'chevron-down': chevronDown,
  'chevron-left': chevronLeft,
  'arrow-left': arrowLeft,
  'arrow-right': arrowRight,
  'clock': clock,
  'user': user,
  'users': users,
  'mail': mail,
  'lock': lock,
  'eye': eye,
  'eye-off': eyeOff,
  'shield-check': shieldCheck,
  'zap': zap,
  'credit-card': creditCard,
  'receipt': receipt,
  'banknote': banknote,
  'settings': settings,
  'scissors': scissors,
  'building-2': building2,
  'truck': truck,
  'shopping-bag': shoppingBag,
  'sparkles': sparkles,
  'stethoscope': stethoscope,
  'triangle-alert': triangleAlert,
  'send': send,
  'ellipsis-vertical': ellipsisVertical,
  'log-out': logOut,
  'history': history,
  'activity': activity,
  'cpu': cpu,
  'radio': radio,
  'thermometer': thermometer,
  'file-text': fileText,
  'globe': globe,
  'link': link,
  'refresh-cw': refreshCw,
  'circle-alert': circleAlert,
  'check-check': checkCheck,
  'badge-check': badgeCheck,
  'trash-2': trash2,
  'pencil': pencil,
  'store': store,
  'rotate-ccw': rotateCcw,
  'bot': bot,
  'message-circle': messageCircle,
  'log-in': logIn,
  'wallet': wallet,
  'list-checks': listChecks,
  'sliders-horizontal': slidersHorizontal,
  'external-link': externalLink,
  'info': info,
  'menu': menu,
  'map-pin': mapPin,
  'database': database,
  'workflow': workflow,
  'layers': layers,
  'server': server,
  'key-round': keyRound,
  'fingerprint': fingerprint,
  'scale': scale,
  'rocket': rocket,
  'package': package,
  'id-card': idCard,
  'calendar-check': calendarCheck,
};

export type IconName = 'house' | 'calendar' | 'calendar-days' | 'message-square' | 'ellipsis' | 'plus' | 'bell' | 'search' | 'phone' | 'copy' | 'share-2' | 'check' | 'circle-check' | 'x' | 'chevron-right' | 'chevron-down' | 'chevron-left' | 'arrow-left' | 'arrow-right' | 'clock' | 'user' | 'users' | 'mail' | 'lock' | 'eye' | 'eye-off' | 'shield-check' | 'zap' | 'credit-card' | 'receipt' | 'banknote' | 'settings' | 'scissors' | 'building-2' | 'truck' | 'shopping-bag' | 'sparkles' | 'stethoscope' | 'triangle-alert' | 'send' | 'ellipsis-vertical' | 'log-out' | 'history' | 'activity' | 'cpu' | 'radio' | 'thermometer' | 'file-text' | 'globe' | 'link' | 'refresh-cw' | 'circle-alert' | 'check-check' | 'badge-check' | 'trash-2' | 'pencil' | 'store' | 'rotate-ccw' | 'bot' | 'message-circle' | 'log-in' | 'wallet' | 'list-checks' | 'sliders-horizontal' | 'external-link' | 'info' | 'menu' | 'map-pin' | 'database' | 'workflow' | 'layers' | 'server' | 'key-round' | 'fingerprint' | 'scale' | 'rocket' | 'package' | 'id-card' | 'calendar-check';

/** Inline SVG for an icon. `cls` adds size/colour utility classes (e.g. 'ico-sm'). */
export function icon(name: IconName, cls = ''): string {
  const svg = ICONS[name] ?? '';
  return svg
    .replace(/<!--[\s\S]*?-->\s*/g, '')
    .replace(/\sclass="[^"]*"/, '')
    .replace(/\swidth="24"\s+height="24"/, '')
    .replace('<svg', `<svg class="ico ${cls}" aria-hidden="true" focusable="false"`);
}

/** Icon as a trusted Raw fragment for use inside html`` templates. */
export const ic = (name: IconName, cls = ''): Raw => raw(icon(name, cls));
