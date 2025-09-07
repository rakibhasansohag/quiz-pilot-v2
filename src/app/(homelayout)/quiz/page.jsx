"use client";
import Select from 'react-select';
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import ResponsiveWidthProvider from "@/components/shared/ResponsiveWidthProvider/ResponsiveWidthProvider";
import Lottie from "lottie-react";
import techSlidingLottie from "../../../components/techSlidingLottie.json"
import Text from "@/components/shared/Typography/Text";

export default function QuizSetup() {
    const [difficulty, setDifficulty] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedAmount, setSelectedAmount] = useState("");
    const [open, setOpen] = useState(false);

    const difficulties = ["Easy", "Medium", "Hard"];
    const categories = [
        { value: "JavaScript", label: "JavaScript" },
        { value: "Python", label: "Python" },
        { value: "C", label: "C" },
        { value: "C++", label: "C++" },
    ];
    const amounts = [
        { value: 5, label: "5 Questions" },
        { value: 10, label: "10 Questions" },
        { value: 15, label: "15 Questions" },
    ]

    const closeDialogue = () => {
        setOpen(false);
        setDifficulty("");
        setSelectedCategory("");
    }

    return (
        <ResponsiveWidthProvider>
            <section className="grid items-center gap-5 md:grid-cols-2 my-5">
                <div>
                    <Lottie animationData={techSlidingLottie} className="max-w-[60vh] mx-auto"></Lottie>
                </div>
                <div>
                    <div className="max-w-2xl mx-auto rounded-2xl shadow-lgtext-center space-y-2 mb-8">
                        <Text tag="heading" text="Quiz Quest"></Text>
                        {/* <p class="text-lg mb-6">Test your knowledge and challenge yourself with fun questions!</p> */}
                        <Text tag="subheading" text="Test your knowledge and challenge yourself with fun questions!"></Text>
                    </div>

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button size="lg" className="rounded-2xl shadow-md px-6 py-3">
                                Start a Quiz
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="max-w-md rounded-2xl shadow-lg p-6">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold text-center">
                                    Choose Your Quiz
                                </DialogTitle>
                                <DialogDescription>

                                </DialogDescription>
                            </DialogHeader>

                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.4 }}
                                className="space-y-6 mt-4"
                            >
                                {/* Difficulty */}
                                <div>
                                    <h2 className="text-lg font-medium mb-2">Select Difficulty</h2>
                                    <div className="flex gap-3 flex-wrap">
                                        {difficulties.map((level) => (
                                            <motion.button
                                                key={level}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setDifficulty(level)}
                                                className={`px-4 py-2 rounded-xl border shadow-sm ${difficulty === level ? "ring-2 ring-indigo-500" : ""
                                                    }`}
                                            >
                                                {level}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                {/* Category */}
                                <div>
                                    <h2 className="text-lg font-medium mb-2">Select Category</h2>
                                    <Select
                                        className="basic-single w-1/2 text-sm"
                                        placeholder="Question Category"
                                        isClearable={true}
                                        onChange={(option) => setSelectedCategory(option)}
                                        name="Amount"
                                        options={categories}
                                    />
                                </div>

                                {/* Amount */}
                                <div>
                                    <h2 className="text-lg font-medium mb-2">Select Amount</h2>
                                    <Select
                                        className="basic-single w-1/2 text-sm"
                                        placeholder="Question Amount"
                                        isClearable={true}
                                        onChange={(option) => setSelectedAmount(option)}
                                        name="Amount"
                                        options={amounts}
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-between pt-4">
                                    <Button variant="outline"
                                        onClick={closeDialogue}>Cancel</Button>
                                    <Button
                                        disabled={!difficulty || !selectedCategory || !selectedAmount}
                                        className="px-6 py-2 rounded-xl shadow-md"
                                    >
                                        Start Quiz
                                    </Button>
                                </div>
                            </motion.div>
                        </DialogContent>
                    </Dialog>
                </div>
            </section>

        </ResponsiveWidthProvider>
    );
}
