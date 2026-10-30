const english = {
  title: 'Change membership', review: 'Review plan change', renewalPrice: 'New renewal price', loading: 'Checking plan change…',
  upgrade: 'Pay {price} to upgrade', scheduled: 'Schedule change', back: 'Back',
  upgradeDetail: 'After payment, add {credits} Credits to this period. Usage stays recorded; the period still ends on {date}.',
  scheduledDetail: 'Switch to {plan} on {date}. Your current membership and Credits stay available until then.',
  error: 'Unable to confirm the change. Refresh and try again.', cancel: 'Cancel this change', resume: 'Continue payment',
  scheduleNote: 'To cancel renewal, cancel the scheduled plan change first, then open billing management.',
  states: { open: 'Waiting for upgrade payment', paid: 'Payment received; applying upgrade', scheduled: 'Plan change scheduled', applied: 'Plan change completed', cancelled: 'Plan change cancelled', expired: 'Upgrade checkout expired', refunded: 'The billing period changed. Your payment was refunded; please review a new quote.' },
}

const chinese = {
  title: '变更会员套餐', review: '查看变更明细', renewalPrice: '变更后续费价', loading: '正在确认变更信息…',
  upgrade: '支付 {price} 升级', scheduled: '确认预约变更', back: '返回',
  upgradeDetail: '付款成功后，本期增加 {credits} Credits。已用额度保留，到期日仍为 {date}。',
  scheduledDetail: '将于 {date} 切换为 {plan}，本期套餐和额度保持有效。',
  error: '暂时无法确认变更，请刷新后重试。', cancel: '取消本次变更', resume: '继续支付差价',
  scheduleNote: '如需取消续费，请先取消预约变更，再打开账单管理。',
  states: { open: '等待支付升级差价', paid: '已收到付款，正在完成升级', scheduled: '已预约套餐变更', applied: '套餐变更已完成', cancelled: '套餐变更已取消', expired: '升级付款已过期', refunded: '账单周期已变化，款项已退回，请重新确认升级。' },
}

const traditional = { ...chinese, renewalPrice: '變更後續費價', title: '變更會員方案', review: '查看變更明細', loading: '正在確認變更資訊…', upgrade: '支付 {price} 升級', scheduled: '確認預約變更', back: '返回', upgradeDetail: '付款成功後，本期增加 {credits} Credits。已用額度保留，到期日仍為 {date}。', scheduledDetail: '將於 {date} 切換為 {plan}，本期方案與額度保持有效。', error: '暫時無法確認變更，請重新整理後再試。', cancel: '取消本次變更', resume: '繼續支付差價', scheduleNote: '如需取消續費，請先取消預約變更，再開啟帳單管理。', states: { open: '等待支付升級差價', paid: '已收到付款，正在完成升級', scheduled: '已預約方案變更', applied: '方案變更已完成', cancelled: '方案變更已取消', expired: '升級付款已過期', refunded: '帳單週期已變更，款項已退回，請重新確認升級。' } }

const japanese = { ...english, renewalPrice: '変更後の更新料金', title: 'プランを変更', review: '変更内容を確認', loading: '変更内容を確認中…', upgrade: '{price} を支払ってアップグレード', scheduled: '変更を予約', back: '戻る', upgradeDetail: '支払い後、今期に {credits} Credits を追加します。使用済み分は保持され、有効期限は {date} のままです。', scheduledDetail: '{date} に {plan} へ変更します。それまでは現在のプランと Credits が有効です。', error: '変更を確認できません。更新して再試行してください。', cancel: 'この変更を取消', resume: '差額の支払いを続ける', scheduleNote: '自動更新を停止するには、まず予約したプラン変更を取り消してから請求管理を開いてください。', states: { open: '差額の支払い待ち', paid: '支払い済み、変更処理中', scheduled: 'プラン変更を予約済み', applied: 'プラン変更完了', cancelled: 'プラン変更を取消済み', expired: '支払い期限切れ', refunded: '請求期間が変わったため返金しました。再度ご確認ください。' } }

const korean = { ...english, renewalPrice: '변경 후 갱신 요금', title: '멤버십 변경', review: '변경 내용 확인', loading: '변경 내용을 확인하는 중…', upgrade: '{price} 결제 후 업그레이드', scheduled: '변경 예약', back: '뒤로', upgradeDetail: '결제 후 이번 기간에 {credits} Credits가 추가됩니다. 사용량과 만료일({date})은 유지됩니다.', scheduledDetail: '{date}에 {plan}(으)로 변경됩니다. 그때까지 현재 멤버십과 Credits가 유지됩니다.', error: '변경을 확인할 수 없습니다. 새로 고침 후 다시 시도하세요.', cancel: '변경 취소', resume: '차액 결제 계속', scheduleNote: '자동 갱신을 취소하려면 먼저 예약된 플랜 변경을 취소한 뒤 결제 관리를 여세요.', states: { open: '업그레이드 차액 결제 대기', paid: '결제 완료, 업그레이드 처리 중', scheduled: '플랜 변경 예약됨', applied: '플랜 변경 완료', cancelled: '플랜 변경 취소됨', expired: '결제 기한 만료', refunded: '결제 기간이 변경되어 환불되었습니다. 다시 확인해 주세요.' } }

export function subscriptionChangeCopy(lang) {
  return ({ 'zh-CN': chinese, 'zh-TW': traditional, ja: japanese, ko: korean })[lang] || english
}
