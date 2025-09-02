import { ref, reactive } from 'vue';
import type { FormInstance } from 'element-plus';

export function useFormDialog<T extends Record<string, any>>(
  initialForm: T,
  resetCallback?: () => void
) {
  const dialogVisible = ref(false);
  const isEditMode = ref(false);
  const submitLoading = ref(false);
  const formRef = ref<FormInstance>();

  const form = reactive<T>({ ...initialForm });

  const open = (editData?: Partial<T>) => {
    if (editData) {
      isEditMode.value = true;
      Object.assign(form, editData);
    } else {
      isEditMode.value = false;
      resetForm();
    }
    dialogVisible.value = true;
  };

  const close = () => {
    dialogVisible.value = false;
    resetForm();
  };

  const resetForm = () => {
    Object.assign(form, initialForm);
    formRef.value?.resetFields();
    resetCallback?.();
  };

  const validate = async (): Promise<boolean> => {
    if (!formRef.value) return false;
    
    try {
      await formRef.value.validate();
      return true;
    } catch {
      return false;
    }
  };

  const submit = async (submitHandler: (formData: T) => Promise<void>) => {
    const isValid = await validate();
    if (!isValid) return false;

    try {
      submitLoading.value = true;
      await submitHandler({ ...form } as T);
      close();
      return true;
    } catch (error) {
      console.error('Form submission failed:', error);
      return false;
    } finally {
      submitLoading.value = false;
    }
  };

  return {
    dialogVisible,
    isEditMode,
    submitLoading,
    formRef,
    form,
    open,
    close,
    resetForm,
    validate,
    submit,
  };
}
