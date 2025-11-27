let isSubmitting = false

export function debounceSubmit(promiseFunc) {
    if (isSubmitting) {
        return Promise.reject("正在提交，请勿重复点击")
    }
    isSubmitting = true

    return promiseFunc()
        .finally(() => {
            // 延迟 800ms，避免过快重复提交
            setTimeout(() => {
                isSubmitting = false
            }, 800)
        })
}
