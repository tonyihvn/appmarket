import { useMemo, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../services/api';
import toast from 'react-hot-toast';

interface WysiwygEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export const WysiwygEditor = ({ value, onChange, placeholder = 'Write details here...' }: WysiwygEditorProps) => {
  const quillRef = useRef<any>(null);
  const isUploadingRef = useRef(false);

  // Custom image upload handler
  const handleImageUpload = async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        // Prevent duplicate uploads
        if (isUploadingRef.current) {
          toast.error('Upload already in progress');
          return;
        }

        isUploadingRef.current = true;
        const formData = new FormData();
        formData.append('image', file);

        try {
          const response = await api.uploadEditorImage(formData);
          
          if (response.data.success && response.data.url) {
            // Insert image into editor
            const quill = quillRef.current?.getEditor();
            if (quill) {
              const range = quill.getSelection();
              quill.insertEmbed(range.index, 'image', response.data.url);
              quill.setSelection(range.index + 1);
            }
            toast.success('Image uploaded successfully');
          } else {
            toast.error('Failed to upload image');
          }
        } catch (error: any) {
          console.error('Image upload error:', error);
          toast.error(error.response?.data?.message || 'Failed to upload image');
        } finally {
          isUploadingRef.current = false;
        }
      }
    };
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          ['bold', 'italic', 'underline'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'image'],
        ],
        handlers: {
          image: handleImageUpload,
        },
      },
    }),
    []
  );

  const formats = ['bold', 'italic', 'underline', 'list', 'bullet', 'link', 'image'];

  return (
    <div className="rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden bg-white dark:bg-gray-800 quill-wrapper">
      <ReactQuill
        ref={quillRef}
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        theme="snow"
        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-light min-h-[180px]"
      />
      <style>{`
        .quill-wrapper .ql-container {
          font-size: inherit;
        }
        .quill-wrapper .ql-editor {
          min-height: 180px;
          color: inherit;
        }
        .quill-wrapper .ql-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
        }
        .dark .quill-wrapper .ql-toolbar {
          background-color: #111827;
          border-color: #374151;
        }
        .dark .quill-wrapper .ql-container {
          border-color: #374151;
        }
        .dark .quill-wrapper .ql-editor {
          background-color: #111827;
          color: #f3f4f6;
        }
        .dark .quill-wrapper .ql-snow a {
          color: #60a5fa;
        }
      `}</style>
    </div>
  );
};
